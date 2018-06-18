import { Sha256 } from "@iov/crypto";
import { AddressBytes, Algorithm, ChainID, Nonce, PublicKeyBundle, SignableBytes } from "@iov/types";

export const keyToAddress = (key: PublicKeyBundle) =>
  Sha256.digest(keyToIdentifier(key)).then((bz: Uint8Array) => bz.slice(0, 20) as AddressBytes);

export const keyToIdentifier = (key: PublicKeyBundle) =>
  Uint8Array.from([...algoToPrefix(key.algo), ...key.data]);

const algoToPrefix = (algo: Algorithm) => {
  switch (algo) {
    case Algorithm.ED25519:
      return encodeAsAscii("sigs/ed25519/");
    case Algorithm.SECP256K1:
      return encodeAsAscii("sigs/secp256k1/");
    default:
      throw new Error("Unsupported algorithm: " + algo);
  }
};

const toNums = (str: string) => str.split("").map((x: string) => x.charCodeAt(0));
export const encodeAsAscii = (str: string) => Uint8Array.from(toNums(str));

// append chainID and nonce to the raw tx bytes to prepare for signing
export const appendSignBytes = (bz: Uint8Array, chainID: ChainID, nonce: Nonce) =>
  Uint8Array.from([...bz, ...encodeAsAscii(chainID), ...nonce.toBytesBE()]) as SignableBytes;

// tendermint hash (will be) first 20 bytes of sha256
// probably only works after 0.21, but no need to import ripemd160 now
export const tendermintHash = (data: Uint8Array) =>
  Sha256.digest(data).then((bz: Uint8Array) => bz.slice(0, 20));

export const hashId = encodeAsAscii("hash/sha256/");
export const hashIdentifier = async (data: Uint8Array) =>
  Uint8Array.from([...hashId, ...(await Sha256.digest(data))]);

// typescript forces us to return number on reduce, so we count how many elements match
// and make sure it is all
export const arraysEqual = (a: Uint8Array, b: Uint8Array): boolean =>
  a.length === b.length && a.every((n: number, i: number): boolean => n === b[i]);

export const isHashIdentifier = (ident: Uint8Array): boolean =>
  arraysEqual(hashId, ident.slice(0, hashId.length));