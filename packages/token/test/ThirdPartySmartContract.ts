import {
  PublicKey,
  SmartContract,
  UInt64,
  method,
  AccountUpdate,
  Permissions,
  DeployArgs,
  PrivateKey,
  isReady,
  Circuit,
} from 'snarkyjs';
import TokenSmartContract from '../src/token.js';
import TokenHolder from './TokenHolder.js';

await isReady;

class ThirdPartySmartContract extends SmartContract {
  public static tokenSmartContractAddress: PublicKey =
    PrivateKey.random().toPublicKey();

  public deploy(args?: DeployArgs) {
    super.deploy(args);
    this.account.permissions.set({
      ...Permissions.default(),
      access: Permissions.proof(),
      send: Permissions.proof(),
    });
  }

  public get tokenContract() {
    if (!ThirdPartySmartContract.tokenSmartContractAddress) {
      throw new Error('Token smart contract address unknown!');
    }
    return new TokenSmartContract(
      ThirdPartySmartContract.tokenSmartContractAddress
    );
  }

  public get tokenHolder() {
    const tokenHolder = new TokenHolder(
      this.address,
      this.tokenContract.token.id
    );
    TokenHolder.tokenSmartContractAddress =
      ThirdPartySmartContract.tokenSmartContractAddress;
    return tokenHolder;
  }

  public transfer(from: PublicKey, to: PublicKey, amount: UInt64) {
    this.tokenContract.transfer(from, to, amount);
  }

  @method
  public deposit(amount: UInt64) {
    this.transfer(this.sender, this.address, amount);
  }

  @method
  public withdraw(amount: UInt64) {
    const tokenHolder = this.tokenHolder;
    tokenHolder.withdraw(this.sender, amount);
    this.tokenContract.approveAccountUpdate(tokenHolder.self);
  }
}

export default ThirdPartySmartContract;
