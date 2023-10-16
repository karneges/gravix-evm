import { GravixVault } from "../utils/Vault";
import { getBytes, Signer, solidityPackedKeccak256 } from "ethers";

export class PriceService {
  static getPriceSignature = async ({
    price,
    signer,
    timestamp,
  }: {
    price: bigint;
    signer: Signer;
    timestamp: number;
  }) => {
    return await signer.signMessage(
      getBytes(
        solidityPackedKeccak256(["uint256", "uint256"], [price, timestamp]),
      ),
    );
  };
}
