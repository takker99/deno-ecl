// This script licensed under the MIT.
// http://orgachem.mit-license.org
//
// Original script:
//  escape Codec Library: js (Ver.041208)
//  Copyright (C) http://nurucom-archives.hp.infoseek.co.jp/digital/
import { JCT11280, JCT8836 } from "./table.ts";

/**
 * @fileoverview Escape Codec Library for Google Closure Library.
 *     The original script provide at
 *     "http://nurucom-archives.hp.infoseek.co.jp/digital/", but this URL is
 *     dead now.
 * @author orga.chem.job@gmail.com (Orga Chem)
 * @author @takker
 */

export const UNICODE = "Unicode" as const;
export const UTF16LE = "UTF16LE" as const;
export const UTF8 = "UTF8" as const;
export const EUCJP = "EUCJP" as const;
export const JIS8 = "JIS8" as const;
export const JIS7 = "JIS7" as const;
export const SJIS = "SJIS" as const;
export const encodes = [
  UNICODE,
  UTF16LE,
  UTF8,
  EUCJP,
  JIS8,
  JIS7,
  SJIS,
] as const;
export type Encode = typeof encodes[number];

/**
 * Escapes Shift-JIS.
 * @param str A Shift-JIS string.
 * @return An escaped Shift-JIS string.
 */
export const escapeSJIS = (str: string) => {
  const func = (s: string) => {
    let c = s.charCodeAt(0), m;
    return c < 128
      ? (c < 16 ? "%0" : "%") + c.toString(16).toUpperCase()
      : 65376 < c && c < 65440
      ? "%" + (c - 65216).toString(16).toUpperCase()
      : (c = JCT11280.indexOf(s)) < 0
      ? "%81E"
      : "%" +
        ((m = ((c < 8272 ? c : (c = JCT11280.lastIndexOf(s))) - (c %= 188)) /
            188) < 31
          ? m + 129
          : m + 193).toString(16).toUpperCase() +
        (64 < (c += c < 63 ? 64 : 65) && c < 91 || 95 == c || 96 < c && c < 123
          ? String.fromCharCode(c)
          : "%" + c.toString(16).toUpperCase());
  };
  const regexp = /[^*+.-9A-Z_a-z-]/g;
  return str.replace(regexp, func);
};

/**
 * Unescapes Shift-JIS.
 * @param  str An escaped Shift-JIS string.
 * @return  An unescaped Shift-JIS string.
 */
export const unescapeSJIS = (str: string) => {
  const func = (s: string) => {
    let c = parseInt(s.substring(1, 3), 16);
    const l = s.length;
    return 3 == l
      ? String.fromCharCode(c < 160 ? c : c + 65216)
      : JCT11280.charAt(
        (c < 160 ? c - 129 : c - 193) * 188 + (4 == l
          ? s.charCodeAt(3) - 64
          : (c = parseInt(s.substring(4), 16)) < 127
          ? c - 64
          : c - 65),
      );
  };
  const regexp =
    /%(8[1-9A-F]|[9E][0-9A-F]|F[0-9A-C])(%[4-689A-F][0-9A-F]|%7[0-9A-E]|[@-~])|%([0-7][0-9A-F]|A[1-9A-F]|[B-D][0-9A-F])/ig;
  return str.replace(regexp, func);
};

/**
 * Escapes EUC-JP.
 * @param  str An EUC-JP string.
 * @return  An escaped EUC-JP string.
 */
export const escapeEUCJP = (str: string) => {
  const func = (s: string) => {
    let c = s.charCodeAt(0);
    return (c < 128
      ? (c < 16 ? "%0" : "%") + c.toString(16)
      : 65376 < c && c < 65440
      ? "%8E%" + (c - 65216).toString(16)
      : (c = JCT8836.indexOf(s)) < 0
      ? "%A1%A6"
      : "%" + ((c - (c %= 94)) / 94 + 161).toString(16) + "%" +
        (c + 161).toString(16)).toUpperCase();
  };
  const regexp = /[^*+.-9A-Z_a-z-]/g;
  return str.replace(regexp, func);
};

/**
 * Unescapes EUC-JP.
 * @param  str An escaped EUC-JP string.
 * @return  An unescaped EUC-JP string.
 */
export const unescapeEUCJP = (str: string) => {
  const func = (s: string) => {
    const c = parseInt(s.substring(1), 16);
    return c < 161
      ? String.fromCharCode(c < 128 ? c : parseInt(s.substring(4), 16) + 65216)
      : JCT8836.charAt((c - 161) * 94 + parseInt(s.substring(4), 16) - 161);
  };
  const regexp =
    /(%A[1-9A-F]|%[B-E][0-9A-F]|%F[0-9A-E]){2}|%8E%(A[1-9A-F]|[B-D][0-9A-F])|%[0-7][0-9A-F]/ig;
  return str.replace(regexp, func);
};

/**
 * Escapes JIS7.
 * @param  str A JIS7 string.
 * @return  An escaped JIS7 string.
 */
export const escapeJIS7 = (str: string) => {
  const u = String.fromCharCode,
    ri = u(92, 120, 48, 48, 45, 92, 120, 55, 70),
    rj = u(65377, 45, 65439, 93, 43);
  const H = (c: number) => {
    return 41 < c && c < 58 && 44 != c || 64 < c && c < 91 || 95 == c ||
        96 < c && c < 123
      ? u(c)
      : "%" + c.toString(16).toUpperCase();
  };
  const I = (s: string) => {
    const c = s.charCodeAt(0);
    return (c < 16 ? "%0" : "%") + c.toString(16).toUpperCase();
  };
  const rI = /[^*+.-9A-Z_a-z-]/g;
  const ri_func = (s: string) => {
    return "%1B%28B" + s.replace(rI, I);
  };
  const ri_regexp = new RegExp("[" + ri + "]+", "g");
  const rj_func = (s: string) => {
    let c, i = 0, t = "%1B%28I";
    while ((c = s.charCodeAt(i++))) t += H(c - 65344);
    return t;
  };
  const rj_regexp = new RegExp("[" + rj, "g");
  const rij_func = (s: string) => {
    let a, c, i = 0, t = "%1B%24B";
    while ((a = s.charAt(i++))) {
      t += (c = JCT8836.indexOf(a)) < 0
        ? "%21%26"
        : H((c - (c %= 94)) / 94 + 33) + H(c + 33);
    }
    return t;
  };
  const rij_regexp = new RegExp("[^" + ri + rj, "g");
  return ("g" + str + "g").replace(ri_regexp, ri_func).replace(
    rj_regexp,
    rj_func,
  ).replace(rij_regexp, rij_func).slice(8, -1);
};

/**
 * Unescapes JIS7.
 * @param  str An escaped JIS7 string.
 * @return  An unescaped JIS7 string.
 */
export const unescapeJIS7 = (str: string) => { //{{{
  const u = String.fromCharCode;
  const I = (s: string) => {
    return u(parseInt(s.substring(1), 16));
  };
  const J = (s: string) => {
    return u(
      (3 == s.length ? parseInt(s.substring(1), 16) : s.charCodeAt(0)) + 65344,
    );
  };
  const K = (s: string) => {
    let l = s.length;
    return JCT8836.charAt(
      4 < l
        ? (parseInt(s.substring(1), 16) - 33) * 94 +
          parseInt(s.substring(4), 16) - 33
        : 2 < l
        ? (37 == (l = s.charCodeAt(0))
          ? (parseInt(s.substring(1, 3), 16) - 33) * 94 + s.charCodeAt(3)
          : (l - 33) * 94 + parseInt(s.substring(2), 16)) - 33
        : (s.charCodeAt(0) - 33) * 94 + s.charCodeAt(1) - 33,
    );
  };
  const rI = /%[0-7][0-9A-F]/ig;
  const rJ = /(%2[1-9A-F]|%[3-5][0-9A-F])|[!-_]/ig;
  const rK =
    /(%2[1-9A-F]|%[3-6][0-9A-F]|%7[0-9A-E]){2}|(%2[1-9A-F]|%[3-6][0-9A-F]|%7[0-9A-E])[!-~]|[!-~](%2[1-9A-F]|%[3-6][0-9A-F]|%7[0-9A-E])|[!-~]{2}/ig;
  const regexp = /%1B%24%4[02]|%1B%24@/ig;
  const replaceStr = "%1B%24B";

  let i = 0, p, q, s = "";
  const P = ("%28B" + str.replace(/%49/g, "I").replace(regexp, replaceStr))
    .split(/%1B/i);
  while ((p = P[i++])) {
    s += "%24B" == (q = p.substring(0, 4))
      ? p.substring(4).replace(rK, K)
      : "%28I" == q
      ? p.substring(4).replace(rJ, J)
      : p.replace(rI, I).substring(2);
  }
  return s;
};
//}}}

/**
 * Escapes JIS8.
 * @param  str A JIS8 string.
 * @return  An escaped JIS8 string.
 */
export const escapeJIS8 = (str: string) => {
  const u = String.fromCharCode,
    r = u(92, 120, 48, 48, 45, 92, 120, 55, 70, 65377, 45, 65439, 93, 43);
  const H = (c: number) =>
    41 < c && c < 58 && 44 != c || 64 < c && c < 91 || 95 == c ||
      96 < c && c < 123
      ? u(c)
      : "%" + c.toString(16).toUpperCase();
  const I = (s: string) => {
    const c = s.charCodeAt(0);
    return (c < 16 ? "%0" : "%") +
      (c < 128 ? c : c - 65216).toString(16).toUpperCase();
  };
  const rI = /[^*+.-9A-Z_a-z-]/g;
  const fn1 = (s: string) => {
    return "%1B%28B" + s.replace(rI, I);
  };
  const fn2 = (s: string) => {
    let a, c, i = 0, t = "%1B%24B";
    while ((a = s.charAt(i++))) {
      t += (c = JCT8836.indexOf(a)) < 0
        ? "%21%26"
        : H((c - (c %= 94)) / 94 + 33) + H(c + 33);
    }
    return t;
  };
  const rx1 = new RegExp("[" + r, "g");
  const rx2 = new RegExp("[^" + r, "g");
  return (["g", str, "g"].join("")).replace(rx1, fn1).replace(rx2, fn2).slice(
    8,
    -1,
  );
};

/**
 * Unescapes JIS8.
 * @param  str An escaped JIS8 string.
 * @return  An unescaped JIS8 string.
 */
export const unescapeJIS8 = (str: string) => { //{{{
  const I = (s: string) => {
    const c = parseInt(s.substring(1), 16);
    return String.fromCharCode(c < 128 ? c : c + 65216);
  };
  const K = (s: string) => {
    let l = s.length;
    return JCT8836.charAt(
      4 < l
        ? (parseInt(s.substring(1), 16) - 33) * 94 +
          parseInt(s.substring(4), 16) - 33
        : 2 < l
        ? (37 == (l = s.charCodeAt(0))
          ? (parseInt(s.substring(1, 3), 16) - 33) * 94 + s.charCodeAt(3)
          : (l - 33) * 94 + parseInt(s.substring(2), 16)) - 33
        : (s.charCodeAt(0) - 33) * 94 + s.charCodeAt(1) - 33,
    );
  };
  const rI = /%([0-7][0-9A-F]|A[1-9A-F]|[B-D][0-9A-F])/ig;
  const rK =
    /(%2[1-9A-F]|%[3-6][0-9A-F]|%7[0-9A-E]){2}|(%2[1-9A-F]|%[3-6][0-9A-F]|%7[0-9A-E])[!-~]|[!-~](%2[1-9A-F]|%[3-6][0-9A-F]|%7[0-9A-E])|[!-~]{2}/ig;
  const rx1 = /%1B%24%4[02]|%1B%24@/ig;
  const str1 = "%28B";
  const str2 = "%1B%24B";
  const str3 = "%24B";

  let i = 0, p, s = "";
  const P = (str1 + str.replace(rx1, str2)).split("");
  while ((p = P[i++])) {
    s += str3 == p.substring(0, 4)
      ? p.substring(4).replace(rK, K)
      : p.replace(rI, I).substring(2);
  }
  return s;
};

/**
 * Escapes Unicode.
 * @param  str A Unicode string.
 * @return  An escaped Unicode string.
 */
export const escapeUnicode = (str: string) => { //{{{
  const rx1 = /[^*+.-9A-Z_a-z-]/g;
  const fn1 = (s: string) => {
    const c = s.charCodeAt(0);
    return (c < 16 ? "%0" : c < 256 ? "%" : c < 4096 ? "%u0" : "%u") +
      c.toString(16).toUpperCase();
  };
  return str.replace(rx1, fn1);
};
//}}}

/**
 * Unescapes Unicode.
 * @param  str An escaped Unicode string.
 * @return  An unescaped Unicode string.
 */
export const unescapeUnicode = (str: string) => {
  const rx1 = /%u[0-9A-F]{4}|%[0-9A-F]{2}/ig;
  const fn1 = (s: string) => {
    return String.fromCharCode(parseInt("0x" + s.substring(s.length / 3), 16));
  };
  return str.replace(rx1, fn1);
};
//}}}

const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
/**
 * Escapes UTF7.
 * @param  str A UTF7 string.
 * @return  An escaped UTF7 string.
 */
export const escapeUTF7 = (str: string) => { //{{{
  const B = characters
    .split("");
  const E = (s: string) => {
    let c = s.charCodeAt(0);
    return B[c >> 10] + B[c >> 4 & 63] +
      B[(c & 15) << 2 | (c = s.charCodeAt(1)) >> 14] +
      (0 <= c
        ? B[c >> 8 & 63] + B[c >> 2 & 63] +
          B[(c & 3) << 4 | (c = s.charCodeAt(2)) >> 12] + (0 <= c
            ? B[c >> 6 & 63] + B[c & 63]
            : "")
        : "");
  };
  const re = /[^+]{1,3}/g;
  const rx1 = /[^*+.-9A-Z_a-z-]+[*+.-9A-Z_a-z-]|[+]/g;
  const fn1 = (s: string) => {
    if ("+" == s) return "+-";
    const l = s.length - 1, w = s.charAt(l);
    return "+" + s.substring(0, l).replace(re, E) +
      ("+" == w ? "-+-" : "*" == w || "." == w || "_" == w ? w : "-" + w);
  };
  return (str + "g").replace(rx1, fn1).slice(0, -1);
};

/**
 * Unescapes UTF7.
 * @param  str An escaped UTF7 string.
 * @return  An unescaped UTF7 string.
 */
export const unescapeUTF7 = (str: string) => {
  let i = 0;
  const B = {} as Record<string, number>;
  while (i < 64) {
    B[characters.charAt(i)] = i++;
  }
  const rx1 = /[+][+/-9A-Za-z]*-?/g;
  const fn1 = (s: string) => {
    if ("+-" == s) return "+";
    let b = B[s.charAt(1)], c, i = 1, t = "";
    while (0 <= b) {
      if ((c = i & 7) < 6) {
        c = c < 3
          ? b << 10 | B[s.charAt(++i)] << 4 | (b = B[s.charAt(++i)]) >> 2
          : (b & 3) << 14 | B[s.charAt(++i)] << 8 | B[s.charAt(++i)] << 2 |
            (b = B[s.charAt(++i)]) >> 4;
      } else {
        c = (b & 15) << 12 | B[s.charAt(++i)] << 6 | B[s.charAt(++i)];
        b = B[s.charAt(++i)];
      }
      if (c) t += String.fromCharCode(c);
    }
    return t;
  };
  return str.replace(rx1, fn1);
};

/**
 * Escapes UTF8.
 * @param  str A UTF8 string.
 * @return  An escaped UTF8 string.
 */
export const escapeUTF8 = (str: string) => {
  const rx1 = /[^*+.-9A-Z_a-z-]/g;
  const fn1 = (s: string) => {
    const c = s.charCodeAt(0);
    return (c < 16
      ? "%0" + c.toString(16)
      : c < 128
      ? "%" + c.toString(16)
      : c < 2048
      ? "%" + (c >> 6 | 192).toString(16) + "%" + (c & 63 | 128).toString(16)
      : "%" + (c >> 12 | 224).toString(16) + "%" +
        (c >> 6 & 63 | 128).toString(16) + "%" + (c & 63 | 128).toString(16))
      .toUpperCase();
  };
  return str.replace(rx1, fn1);
};

/**
 * Unescapes UTF8.
 * @param  str An escaped UTF8 string.
 * @return  An unescaped UTF8 string.
 */
export const unescapeUTF8 = (str: string) => {
  const rx1 =
    /%(E(0%[AB]|[1-CEF]%[89AB]|D%[89])[0-9A-F]|C[2-9A-F]|D[0-9A-F])%[89AB][0-9A-F]|%[0-7][0-9A-F]/ig;
  const fn1 = (s: string) => {
    const c = parseInt(s.substring(1), 16);
    return String.fromCharCode(
      c < 128
        ? c
        : c < 224
        ? (c & 31) << 6 | parseInt(s.substring(4), 16) & 63
        : ((c & 15) << 6 | parseInt(s.substring(4), 16) & 63) << 6 |
          parseInt(s.substring(7), 16) & 63,
    );
  };
  return str.replace(rx1, fn1);
};

/**
 * Escapes UTF16LE.
 * @param  str A UTF16LE string.
 * @return  An escaped UTF16LE string.
 */
export const escapeUTF16LE = (str: string) => {
  const H = (c: number) => {
    return 41 < c && c < 58 && 44 != c || 64 < c && c < 91 || 95 == c ||
        96 < c && c < 123
      ? String.fromCharCode(c)
      : (c < 16 ? "%0" : "%") + c.toString(16).toUpperCase();
  };
  const rx1 = /[^ ]| /g;
  const fn1 = (s: string) => {
    const c = s.charCodeAt(0);
    return H(c & 255) + H(c >> 8);
  };
  return str.replace(rx1, fn1);
};

/**
 * Unescapes UTF16LE.
 * @param  str An escaped UTF16LE string.
 * @return  An unescaped UTF16LE string.
 */
export const unescapeUTF16LE = (str: string) => {
  const u = String.fromCharCode, b = u(92, 120, 48, 48, 45, 92, 120, 70, 70);
  const rx1 = /^%FF%FE/i;
  const rx2 = new RegExp(
    `%[0-9A-F]{2}%[0-9A-F]{2}|%[0-9A-F]{2}[${b}]|[${b}]%[0-9A-F]{2}|[${b}]{2}`,
    "ig",
  );
  const fn1 = (s: string) => {
    let l = s.length;
    return u(
      4 < l
        ? parseInt("0x" + s.substring(4, 6) + s.substring(1, 3), 16)
        : 2 < l
        ? 37 == (l = s.charCodeAt(0))
          ? parseInt(s.substring(1, 3), 16) | s.charCodeAt(3) << 8
          : l | parseInt(s.substring(2), 16) << 8
        : s.charCodeAt(0) | s.charCodeAt(1) << 8,
    );
  };
  return str.replace(rx1, "").replace(rx2, fn1);
};

/**
 * Get escape code type, such as "UTF8" or "EUC-JP".
 * @param  str A string that was escaped unkwoun format.
 * @return  Escape format string.
 */
export const getEscapeCodeType = (str: string): Encode => {
  const rx1 = /%u[0-9A-F]{4}/i;
  const rx2 =
    /%([0-9A-DF][0-9A-F]%[8A]0%|E0%80|[0-7][0-9A-F]|C[01])%[8A]0|%00|%[7F]F/i;
  const rx3 = /%E[0-9A-F]%[8A]0%[8A]0|%[CD][0-9A-F]%[8A]0/i;
  const rx4 = /%F[DE]/i;
  const rx5 = /%8[0-9A-D]|%9[0-9A-F]|%A0/i;
  const rx6 = /%1B/i;
  const rx7 = /%[A-D][0-9A-F]/i;
  const rx8 = /%[0-9A-F]{2}|[^ ]| /ig;
  const func1 = (s: string) => {
    return s.length < 3 ? "40" : s.substring(1);
  };

  if (rx1.test(str)) return UNICODE;
  if (rx2.test(str)) return UTF16LE;
  if (rx3.test(str)) return UTF8;
  if (rx4.test(str)) {
    return rx5.test(str) ? UTF16LE : EUCJP;
  }
  if (rx6.test(str)) {
    return rx7.test(str) ? JIS8 : JIS7;
  }
  const S = str.substring(0, 6143).replace(rx8, func1);
  let i = 0;
  let c: number;
  let C: number;
  let T: Encode | undefined;
  while (0 <= (c = parseInt(S.substring(i, i += 2), 16)) && i < 4092) {
    if (128 <= c) {
      if ((C = parseInt(S.substring(i, i + 2), 16)) < 128) i += 2;
      else if (194 <= c && c < 240 && C < 192) {
        if (c < 224) {
          T = UTF8;
          i += 2;
          continue;
        }
        if (2 == parseInt(S.charAt(i + 2), 16) >> 2) {
          T = UTF8;
          i += 4;
          continue;
        }
      }
      if (142 == c && 161 <= C && C < 224) {
        if (!T) T = EUCJP;
        if (EUCJP == T) continue;
      }
      if (c < 161) return SJIS;
      if (c < 224 && !T) {
        if ((164 == c && C < 244 || 165 == c && C < 247) && 161 <= C) i += 2;
        else T = 224 <= C ? EUCJP : SJIS;
      } else T = EUCJP;
    }
  }
  return T ? T : EUCJP;
};

/**
 * Get unescaped string, the using encode type is automatically determined
 * @param  str Any escaped string.
 * @return  An unescaped string.
 */
export const unescape = (str: Encode) => {
  const type = getEscapeCodeType(str);
  switch (type) {
    case UTF8:
      return unescapeUTF8(str);
    case UTF16LE:
      return unescapeUTF16LE(str);
    case EUCJP:
      return unescapeEUCJP(str);
    case SJIS:
      return unescapeSJIS(str);
    case UNICODE:
      return unescapeUnicode(str);
    case JIS8:
      return unescapeJIS8(str);
    case JIS7:
      return unescapeJIS7(str);
  }
};

/**
 * @param  str Test string.
 * @return  Whether the string was encoded by Unicode.
 */
export const isUnicode = (str: string) => getEscapeCodeType(str) == UNICODE;

/**
 * @param  str Test string.
 * @return  Whether the string was encoded by UTF8.
 */
export const isUTF8 = (str: string) => getEscapeCodeType(str) == UTF8;

/**
 * @param  str Test string.
 * @return  Whether the string was encoded by UTF16LE.
 */
export const isUTF16LE = (str: string) => getEscapeCodeType(str) == UTF16LE;

/**
 * @param  str Test string.
 * @return  Whether the string was encoded by EUCJP.
 */
export const isEUCJP = (str: string) => getEscapeCodeType(str) == EUCJP;

/**
 * @param  str Test string.
 * @return  Whether the string was encoded by SJIS.
 */
export const isSJIS = (str: string) => getEscapeCodeType(str) == SJIS;

/**
 * @param  str Test string.
 * @return  Whether the string was encoded by JIS7.
 */
export const isJIS7 = (str: string) => getEscapeCodeType(str) == JIS7;

/**
 * @param  str Test string.
 * @return  Whether the string was encoded by JIS8.
 */
export const isJIS8 = (str: string) => getEscapeCodeType(str) == JIS8;
