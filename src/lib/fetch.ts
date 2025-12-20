import { z } from "zod";

type FetchProps<T> = {
  schemas: z.ZodType<T>;
  url: string;
  options?: RequestInit;
};

/**
 * 共通のフェッチ関数
 * @param {object} props - 引数オブジェクト
 * @param {z.ZodType<T>} props.schemas - Zodスキーマ
 * @param {string} props.url - APIエンドポイントのURL
 * @param {RequestInit} [props.options] - フェッチオプション
 * @returns {Promise<T>} - パースされたデータ
 * @throws {Error} - フェッチエラーまたはパースエラー
 */
export const customFetch = async <T>({ schemas, url, options = {} }: FetchProps<T>): Promise<T> => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Status code: ${response.status}`);
    }

    const result = await response.json();

    return schemas.parse(result.data);
  } catch (error) {
    throw error;
  }
};

/**
 * バックエンドと直接通信を行うフェッチ関数（Route Handlerでは動かない）
 * @param {object} props - 引数オブジェクト
 * @param {z.ZodType<T>} props.schemas - Zodスキーマ
 * @param {string} props.url - APIエンドポイントのURL
 * @param {RequestInit} [props.options] - フェッチオプション
 * @returns {Promise<T>} - パースされたデータ
 * @throws {Error} - フェッチエラーまたはパースエラー
 */
export async function backendFetch<T>({ schemas, url, options }: FetchProps<T>): Promise<T> {
  return await customFetch({
    schemas,
    url,
    options: { ...options, credentials: "include" },
  });
}

/**
 * Route Handlerと直接通信を行うフェッチ関数
 * @param {object} props - 引数オブジェクト
 * @param {z.ZodType<T>} props.schemas - Zodスキーマ
 * @param {string} props.url - APIエンドポイントのURL
 * @param {RequestInit} [props.options] - フェッチオプション
 * @returns {Promise<T>} - パースされたデータ
 * @throws {Error} - フェッチエラーまたはパースエラー
 */
export async function routeFetch<T>({ schemas, url, options }: FetchProps<T>): Promise<T> {
  return await customFetch({
    schemas,
    url,
    options: { ...options, credentials: "same-origin" },
  });
}
