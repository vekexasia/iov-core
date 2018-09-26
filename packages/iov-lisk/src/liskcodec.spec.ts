import Long from "long";

import { Address, Nonce, SendTx, SignedTransaction, TokenTicker, TransactionKind } from "@iov/bcp-types";
import { Encoding } from "@iov/encoding";
import { Algorithm, ChainId, PublicKeyBundle, PublicKeyBytes, SignatureBytes } from "@iov/tendermint-types";

import { liskCodec } from "./liskcodec";

const { fromAscii, fromHex, toAscii } = Encoding;

// use nethash as chain ID
const liskTestnet = "da3ed6a45429278bac2666961289ca17ad86595d33b31037615d4b8e8f158bba" as ChainId;
const emptyNonce = new Long(0) as Nonce;

describe("liskCodec", () => {
  it("derives addresses properly", () => {
    // https://testnet-explorer.lisk.io/address/6076671634347365051L
    const pubkey: PublicKeyBundle = {
      algo: Algorithm.ED25519,
      data: fromHex("f4852b270f76dc8b49bfa88de5906e81d3b001d23852f0e74ba60cac7180a184") as PublicKeyBytes,
    };
    expect(liskCodec.keyToAddress(pubkey)).toEqual(toAscii("6076671634347365051L"));
  });

  describe("transaction serialization", () => {
    it("can serialize type 0 without memo", () => {
      const pubkey = fromHex("00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff");

      const tx: SendTx = {
        chainId: liskTestnet as ChainId,
        signer: {
          algo: Algorithm.ED25519,
          data: pubkey as PublicKeyBytes,
        },
        timestamp: 865708731,
        kind: TransactionKind.Send,
        amount: {
          whole: 1,
          fractional: 23456789,
          tokenTicker: "LSK" as TokenTicker,
        },
        recipient: toAscii("10010344879730196491L") as Address,
      };
      const nonce = new Long(0) as Nonce;

      const serialized = liskCodec.bytesToSign(tx, nonce).bytes;
      expect(serialized).toEqual(
        fromHex(
          "00bbaa993300112233445566778899aabbccddeeff00112233445566778899aabbccddeeff8aebe3a18b78000b15cd5b0700000000",
        ),
      );
    });

    it("can serialize type 0 with memo", () => {
      const pubkey = fromHex("00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff");

      const tx: SendTx = {
        chainId: liskTestnet as ChainId,
        signer: {
          algo: Algorithm.ED25519,
          data: pubkey as PublicKeyBytes,
        },
        timestamp: 865708731,
        kind: TransactionKind.Send,
        amount: {
          whole: 1,
          fractional: 23456789,
          tokenTicker: "LSK" as TokenTicker,
        },
        recipient: toAscii("10010344879730196491L") as Address,
        memo: "The nice memo I attach to that money for the whole world to read",
      };
      const nonce = new Long(0) as Nonce;

      const serialized = liskCodec.bytesToSign(tx, nonce).bytes;
      expect(serialized).toEqual(
        fromHex(
          "00bbaa993300112233445566778899aabbccddeeff00112233445566778899aabbccddeeff8aebe3a18b78000b15cd5b0700000000546865206e696365206d656d6f20492061747461636820746f2074686174206d6f6e657920666f72207468652077686f6c6520776f726c6420746f2072656164",
        ),
      );
    });

    it("can calculate ID of type 0 without memo", () => {
      const pubkey = fromHex("00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff");

      const tx: SendTx = {
        chainId: liskTestnet as ChainId,
        signer: {
          algo: Algorithm.ED25519,
          data: pubkey as PublicKeyBytes,
        },
        timestamp: 865708731,
        kind: TransactionKind.Send,
        amount: {
          whole: 1,
          fractional: 23456789,
          tokenTicker: "LSK" as TokenTicker,
        },
        recipient: toAscii("10010344879730196491L") as Address,
      };

      const signed: SignedTransaction = {
        transaction: tx,
        primarySignature: {
          nonce: emptyNonce,
          publicKey: {
            algo: Algorithm.ED25519,
            data: pubkey as PublicKeyBytes,
          },
          signature: fromHex("26272829") as SignatureBytes,
        },
        otherSignatures: [],
      };

      const binaryId = liskCodec.identifier(signed);
      expect(fromAscii(binaryId)).toEqual("15806479375328957764");
    });

    it("can create bytes to post", () => {
      const pubkey = fromHex("00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff");

      const tx: SendTx = {
        chainId: liskTestnet as ChainId,
        signer: {
          algo: Algorithm.ED25519,
          data: pubkey as PublicKeyBytes,
        },
        timestamp: 865708731,
        kind: TransactionKind.Send,
        amount: {
          whole: 1,
          fractional: 23456789,
          tokenTicker: "LSK" as TokenTicker,
        },
        recipient: toAscii("10010344879730196491L") as Address,
      };

      const signed: SignedTransaction = {
        transaction: tx,
        primarySignature: {
          nonce: emptyNonce,
          publicKey: {
            algo: Algorithm.ED25519,
            data: pubkey as PublicKeyBytes,
          },
          signature: fromHex("26272829") as SignatureBytes,
        },
        otherSignatures: [],
      };

      const bytes = liskCodec.bytesToPost(signed);
      expect(bytes).toBeTruthy();

      expect(JSON.parse(Encoding.fromUtf8(bytes))).toEqual({
        type: 0,
        timestamp: 865708731,
        amount: "123456789",
        fee: "10000000",
        recipientId: "10010344879730196491L",
        senderPublicKey: "00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff",
        signature: "26272829",
        id: "15806479375328957764",
        asset: {},
      });
    });

    it("fails to serialize transaction with fee", () => {
      const pubkey = fromHex("00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff");

      const tx: SendTx = {
        chainId: liskTestnet as ChainId,
        signer: {
          algo: Algorithm.ED25519,
          data: pubkey as PublicKeyBytes,
        },
        timestamp: 865708731,
        kind: TransactionKind.Send,
        amount: {
          whole: 1,
          fractional: 23456789,
          tokenTicker: "LSK" as TokenTicker,
        },
        fee: {
          whole: 0,
          fractional: 0,
          tokenTicker: "LSK" as TokenTicker,
        },
        recipient: toAscii("10010344879730196491L") as Address,
      };
      const nonce = new Long(0) as Nonce;

      expect(() => liskCodec.bytesToSign(tx, nonce)).toThrowError(/fee must not be set/i);
    });
  });
});
