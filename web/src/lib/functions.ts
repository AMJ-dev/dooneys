import moment from "moment";
import { useContext } from "react";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import UserContext from "@/lib/userContext";
import { api_url } from "@/lib/constants";
import { http } from "@/lib/httpClient";
import {
  ApiResp,
  CartItem,
  ProductVariantOption,
} from "@/lib/types";

export const str_to_url = (str: string) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .replace(/ /g, "-");

export const is_numeric = (num: any) =>
  typeof num === "number" ||
  (typeof num === "string" && num.trim() !== "");

export const format_number = (x: number) =>
  x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export const readable_date = (date: string) =>
  isEmpty(date) ? "" : moment(Date.parse(date)).format("MMMM Do, YYYY");

export const format_currency = (amount: number) =>
  new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 0,
  }).format(amount);

export const readable_time = (time: string) =>
  !time ? "" : moment(time, "HH:mm").format("hh:mm a");

export const readable_datetime = (date: string) =>
  isEmpty(date)
    ? ""
    : moment(Date.parse(date)).format("MMMM Do, YYYY hh:mm a");

export const isEmpty = (str: any) => {
  str = String(str);
  return (
    typeof str === "undefined" ||
    str === "undefined" ||
    !str ||
    str.length === 0 ||
    !/[^\s]/.test(str) ||
    /^\s*$/.test(str)
  );
};

export const ASSET_BASE =
  (api_url as string)?.replace(/\/+$/, "") || "";

export const resolveSrc = (s: string) => {
  if (!s) return s;
  if (/^(?:https?:|blob:|data:)/i.test(s)) return s;
  if (s.startsWith("/")) return `${ASSET_BASE}${s}`;
  return ASSET_BASE ? `${ASSET_BASE}/${s}` : `/${s}`;
};

export const check_login = () => {
  const { login } = useContext(UserContext);
  return new Promise((resolve) => {
    const remember = localStorage.getItem("remember");
    const storedToken = get_token();
    if (storedToken)
      login({ token: storedToken, remember: remember === "1" });
    resolve(true);
  });
};

export const get_token = () => {
  const remember = localStorage.getItem("remember");
  return remember === "1"
    ? localStorage.getItem("token")
    : sessionStorage.getItem("token");
};

export const truncate_string = (string: string) => {
  const max_length = 70;
  return string.length > max_length
    ? `${string.substring(0, max_length)}…`
    : string;
};

export const http_error = (err: AxiosError) => {
  const ax = err as AxiosError<any>;
  const status = ax.response?.status;
  const serverMsg =
    ax.response?.data?.message ??
    ax.response?.data?.error ??
    ax.response?.data?.data ??
    ax.message;

  if (status === 401 || status === 403 || status === 405)
    toast.error(serverMsg || "Unauthorized");
  else if (status && status >= 500)
    toast.error("Server error. Please try again later.");
  else if (ax.request && !ax.response)
    toast.error("Network error. Check your connection.");
  else toast.error(serverMsg || "Unexpected error");
};

export interface CartApiItem {
  product_id: string;
  quantity: number;
  variants: { type: string; option_id?: number }[];
}

const normalizeVariantsForApi = (
  selected?: Record<string, ProductVariantOption>
) => {
  if (!selected) return [];
  return Object.entries(selected).map(([type, opt]) => ({
    type,
    option_id: opt.id,
  }));
};

export const buildCartApiPayload = (
  items: CartItem[]
): CartApiItem[] =>
  items.map((i) => ({
    product_id: i.product.id,
    quantity: i.quantity,
    variants: normalizeVariantsForApi(i.selectedVariants),
  }));

export const fetchCartItems = (items: CartApiItem[]) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (items.length === 0) {
        resolve([]);
        return;
      }

      const payload = { items };

      const res = await http.post("/get-cart-items/", payload);
      const resp: ApiResp = res.data;

      if (!resp.error && resp.data?.items) {
        resolve(resp.data.items);
        return;
      }

      reject(resp.data);
    } catch (error) {
      reject(error);
    }
  });
};

export const gen_random_string = () => {
  let result = "";
  const min = 5;
  const max = 10;
  const length = Math.random() * (max - min) + min;
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
