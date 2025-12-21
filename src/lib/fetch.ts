import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

type FetchProps<T> = {
  schema: z.ZodType<T>;
  url: string;
  options?: RequestInit;
};

/**
 * 共通のフェッチ関数
 * @param {object} props - 引数オブジェクト
 * @param {z.ZodType<T>} props.schema - Zodスキーマ
 * @param {string} props.url - APIエンドポイントのURL
 * @param {RequestInit} [props.options] - フェッチオプション
 * @returns {Promise<T>} - パースされたデータ
 * @throws {Error} - フェッチエラーまたはパースエラー
 */
export const customFetch = async <T>({ schema, url, options = {} }: FetchProps<T>): Promise<T> => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Status code: ${response.status}`);
    }

    const result = await response.json();

    return schema.parse(result);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Fetch error:", error);
    }

    throw error;
  }
};

/**
 * バックエンドと直接通信を行うフェッチ関数（Route Handlerでは動かない）
 * @param {object} props - 引数オブジェクト
 * @param {z.ZodType<T>} props.schema - Zodスキーマ
 * @param {string} props.url - APIエンドポイントのURL
 * @param {RequestInit} [props.options] - フェッチオプション
 * @returns {Promise<T>} - パースされたデータ
 * @throws {Error} - フェッチエラーまたはパースエラー
 */
export async function backendFetch<T>({ schema, url, options = {} }: FetchProps<T>): Promise<T> {
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    throw new Error("認証トークンの取得に失敗しました。");
  }

  return customFetch({
    schema,
    url,
    options: { ...options, headers: { ...options.headers, Authorization: `Bearer ${token}` } },
  });
}

/**
 * Route Handlerと直接通信を行うフェッチ関数
 * @param {object} props - 引数オブジェクト
 * @param {z.ZodType<T>} props.schema - Zodスキーマ
 * @param {string} props.url - APIエンドポイントのURL
 * @param {RequestInit} [props.options] - フェッチオプション
 * @returns {Promise<T>} - パースされたデータ
 * @throws {Error} - フェッチエラーまたはパースエラー
 */
export async function routeHandlerFetch<T>({
  schema,
  url,
  options = {},
}: FetchProps<T>): Promise<T> {
  return customFetch({
    schema,
    url,
    options: { ...options, credentials: "same-origin" },
  });
}
