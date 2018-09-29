import { Stream } from "xstream";
import { BcpCoin, BcpConnection, BcpQueryEnvelope } from "./bcp";
import { Address, TransactionIdBytes } from "./signables";
import { SwapIdBytes } from "./transactions";
export declare enum SwapState {
    OPEN = "open",
    CLAIMED = "claimed",
    EXPIRED = "expired"
}
export interface SwapData {
    readonly id: SwapIdBytes;
    readonly sender: Address;
    readonly recipient: Address;
    readonly hashlock: Uint8Array;
    readonly amount: ReadonlyArray<BcpCoin>;
    readonly timeout: number;
    readonly memo?: string;
}
export interface OpenSwap {
    readonly kind: SwapState.OPEN;
    readonly data: SwapData;
}
export interface ClaimedSwap {
    readonly kind: SwapState.CLAIMED;
    readonly data: SwapData;
    readonly preimage: Uint8Array;
}
export interface ExpiredSwap {
    readonly kind: SwapState.EXPIRED;
    readonly data: SwapData;
}
export declare type BcpAtomicSwap = OpenSwap | ClaimedSwap | ExpiredSwap;
export interface BcpSwapRecipientQuery {
    readonly recipient: Address;
}
export interface BcpSwapSenderQuery {
    readonly sender: Address;
}
export interface BcpSwapIdQuery {
    readonly id: SwapIdBytes;
}
export declare type BcpSwapQuery = BcpSwapRecipientQuery | BcpSwapSenderQuery | BcpSwapIdQuery;
export interface BcpSwapEvent {
    readonly height: number;
    readonly swapid: SwapIdBytes;
    readonly txid: TransactionIdBytes;
}
export interface BcpAtomicSwapConnection extends BcpConnection {
    readonly getSwap: (swap: BcpSwapQuery) => Promise<BcpQueryEnvelope<BcpAtomicSwap>>;
    readonly watchSwap: (swap: BcpSwapQuery) => Stream<BcpAtomicSwap>;
    readonly changeSwap: (swap: BcpSwapQuery) => Stream<BcpSwapEvent>;
}
