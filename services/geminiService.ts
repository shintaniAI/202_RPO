import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ClientInfo, WebSource } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to generate the text report
const generateTextReport = async (
  csvContent: string,
  applicantCsvContent: string,
  clientInfo: ClientInfo,
  competitors: string,
  parts: any[]
): Promise<any> => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        role: "user",
        parts: parts
      },
      config: {
        systemInstruction: "あなたは日本のトップクラスのRPOコンサルタントです。クライアントへの報告資料を作成します。論理的で、かつ実行可能な具体的な提案を含めることが重要です。分析は「KPT（Keep/Problem/Try）」のフレームワークを意識してください。",
        temperature: 0.4,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executive_summary: {
                type: Type.STRING,
                description: "Markdown text: レポート全体の総括。主要KPIのハイライトと、今月の運用の要点を3-4行で簡潔にまとめる。",
            },
            performance_content: {
              type: Type.STRING,
              description: "Markdown text: 運用実績データ(日次)に基づく定量分析。予算消化状況、CPA、CTR、CVRの推移、応募数と目標の乖離分析など、ファネルの歩留まりに言及する。",
            },
            candidate_analysis: {
              type: Type.STRING,
              description: "Markdown text: 応募者データに基づく定性分析。応募者の年齢層、居住地、現年収、職歴の傾向（経験者か未経験者か）、自己PRから読み取れる意欲など。ターゲット人材との適合性を評価する。",
            },
            applicant_demographics: {
              type: Type.OBJECT,
              description: "Statistical breakdown of applicants derived from the CSV data.",
              properties: {
                age_groups: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING, description: "e.g., '20代', '30代', '40代以上'" },
                      value: { type: Type.NUMBER, description: "Count of applicants" }
                    }
                  }
                },
                gender_ratio: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING, description: "e.g., '男性', '女性', '不明'" },
                      value: { type: Type.NUMBER, description: "Count of applicants" }
                    }
                  }
                },
                nationality_ratio: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING, description: "e.g., '日本国籍', '外国籍'" },
                      value: { type: Type.NUMBER, description: "Count of applicants" }
                    }
                  }
                }
              }
            },
            trends_content: {
              type: Type.STRING,
              description: "Markdown text: 市場のトレンド、有効求人倍率、給与相場、求職者の検索キーワード傾向など。",
            },
            market_examples: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of 3 successful job posting examples or case studies in the same industry/role. Include catchphrases, unique benefits, or appeal points used by competitors.",
            },
            strategy_content: {
              type: Type.STRING,
              description: "Markdown text: 今後の戦略分析。必ず **KPTフレームワーク** (Keep: 継続すべき点, Problem: 課題, Try: 次月の対策) を用いて見出しを作成し、構造的に記述すること。",
            },
            recommended_actions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of 3-5 specific, concrete actionable measures (施策) to improve recruitment immediately. e.g. '求人票のキャッチコピーを〇〇に変更', 'スカウトメールの送信時間を〇〇に変更'.",
            }
          },
          required: ["executive_summary", "performance_content", "candidate_analysis", "trends_content", "market_examples", "strategy_content", "recommended_actions"],
        },
      }
    });

    let jsonText = response.text || "{}";
    // Clean up markdown code blocks if present
    jsonText = jsonText.replace(/```json\n?|\n?```/g, "").trim();
    
    const parsed = JSON.parse(jsonText);
    
    // Extract grounding chunks
    const webSources: WebSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
          webSources.push({
            uri: chunk.web.uri,
            title: chunk.web.title
          });
        }
      });
    }

    return { parsed, webSources };
};

// Helper to generate the persona image with timeout
const generatePersonaImage = async (clientInfo: ClientInfo): Promise<string | undefined> => {
    try {
        const prompt = `A professional, high-quality photographic portrait of a successful Japanese candidate for the position of "${clientInfo.jobTitle}" at a modern company. 
        The person looks confident, competent, and approachable. 
        Neutral, professional office background with soft lighting. 
        Cinematic 8k resolution, realistic style.`;

        // Create a timeout promise that rejects after 15 seconds
        const timeoutPromise = new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error("Image generation timed out")), 15000)
        );

        const apiCallPromise = ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                imageConfig: {
                    aspectRatio: "3:4", 
                }
            },
        });

        const response = await Promise.race([apiCallPromise, timeoutPromise]);

        for (const part of (response as any).candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                const base64EncodeString = part.inlineData.data;
                return `data:image/png;base64,${base64EncodeString}`;
            }
        }
        return undefined;
    } catch (e) {
        console.warn("Image generation failed or timed out:", e);
        return undefined; // Fail silently for image, report is more important
    }
};

export const generateReport = async (
  csvContent: string,
  applicantCsvContent: string,
  clientInfo: ClientInfo,
  competitors: string
): Promise<AnalysisResult> => {
  try {
    const parts: any[] = [];

    // Construct a search query context
    const competitorContext = competitors 
      ? `指定された競合他社: ${competitors}` 
      : `クライアント名「${clientInfo.name}」と募集職種「${clientInfo.jobTitle}」から、競合他社を自動的に特定してください。`;

    let promptText = `
      あなたはプロのRPO（Recruitment Process Outsourcing）コンサルタントです。
      クライアント（採用企業）への定例月次報告資料を作成してください。

      ## クライアント情報
      - 企業名: ${clientInfo.name}
      - 募集職種: ${clientInfo.jobTitle}
      - 月次目標/予算: ${clientInfo.monthlyGoal}
      - その他メモ: ${clientInfo.notes}
      
      ## リサーチ指示 (Google Search)
      以下の点についてGoogle検索を行い、最新情報をレポートに反映してください:
      1. **市場トレンド**: 「${clientInfo.jobTitle}」の直近の有効求人倍率、平均給与、検索トレンド（日本国内）。
      2. **競合・事例調査**: ${competitorContext}。また、同職種で採用に成功している他社の求人事例（キャッチコピーや福利厚生の打ち出し方）を具体的に探してください。

      ## レポート構成要件
      1. **全体総括 (Executive Summary)**: マネジメント層向けのハイライト。
      2. **運用実績分析 (Quantitative)**: 日次データに基づく数値分析。CTR, CVRの歩留まりに注目すること。
      3. **応募者属性分析 (Qualitative & Demographics)**: 
         - **定性分析**: どんな人材が来ているか、ターゲットと合致しているか。
         - **統計分析**: CSVデータから「年齢層」「性別」「国籍」の分布を集計してください。
           - ※重要: 性別や国籍のデータが明記されていない場合は、**氏名（漢字か、カタカナ・アルファベットか）や名前の特徴から推測**してカウントしてください。（例: カタカナのみの名前は外国籍の可能性が高い等）
      4. **市場トレンド**: マクロな市場環境。
      5. **他社事例 (Market Examples)**: 採用競合や同業界の成功事例、魅力的な求人キャッチコピーの例を3つリストアップしてください。
      6. **戦略・競合分析 (KPT法)**: 
         - **Keep**: 良かった点、継続すべき点
         - **Problem**: 悪かった点、課題
         - **Try**: 次月の具体的アクション
         の形式で出力してください。
      7. **具体的施策（Action Plan）**: 明日から実行できる具体的な改善施策を3~5つ。

      ## 入力データソース
    `;

    if (csvContent) {
        promptText += `
        1. **運用実績データ(CSVテキスト)**: 日次の数値データあり。Impression, Click, Application, Costが含まれています。CTRとCVRを計算して分析に含めてください。
        `;
    } else {
        promptText += `
        1. **運用実績データ**: なし
        `;
    }

    if (applicantCsvContent) {
        promptText += `
        2. **応募者データ(CSVテキスト)**: 応募者の詳細リストあり。年齢、住所、前職、自己PR、スキル等が含まれています。ここから応募者の傾向（年齢層、経験者比率、居住地など）を分析してください。
        `;
    } else {
        promptText += `
        2. **応募者データ**: なし
        `;
    }

    promptText += `
      ## 制約事項
      - JSON形式で出力してください。
      - Markdown形式を使用してください。
      - 日本語で出力してください。
      
      ${csvContent ? '- 運用実績データの1行目はヘッダーです。「合計」行はサマリーとして使用してください。' : ''}
    `;

    if (csvContent) {
        promptText += `
        ## 運用実績データ (CSV)
        ${csvContent}
        `;
    }

    if (applicantCsvContent) {
        promptText += `
        ## 応募者データ (CSV)
        ${applicantCsvContent}
        `;
    }

    parts.push({ text: promptText });

    const [textResult, personaImage] = await Promise.all([
        generateTextReport(csvContent, applicantCsvContent, clientInfo, competitors, parts),
        generatePersonaImage(clientInfo)
    ]);
    
    // Map snake_case from python/gemini world to camelCase for TS
    const demographicsRaw = textResult.parsed.applicant_demographics;
    let applicantDemographics = undefined;
    if (demographicsRaw) {
        applicantDemographics = {
            ageGroups: demographicsRaw.age_groups || [],
            genderRatio: demographicsRaw.gender_ratio || [],
            nationalityRatio: demographicsRaw.nationality_ratio || [],
        };
    }

    return { 
      executiveSummary: textResult.parsed.executive_summary || "総括の生成に失敗しました。",
      performanceContent: textResult.parsed.performance_content || "実績分析の生成に失敗しました。",
      candidateAnalysis: textResult.parsed.candidate_analysis || "応募者分析の生成に失敗しました。",
      applicantDemographics: applicantDemographics,
      trendsContent: textResult.parsed.trends_content || "市場トレンドの生成に失敗しました。",
      marketExamples: textResult.parsed.market_examples || [],
      strategyContent: textResult.parsed.strategy_content || "戦略提案の生成に失敗しました。",
      recommendedActions: textResult.parsed.recommended_actions || [],
      interviewQuestions: [], // Removed as requested
      personaImageUrl: personaImage,
      webSources: textResult.webSources 
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("レポートの生成中にエラーが発生しました。");
  }
};