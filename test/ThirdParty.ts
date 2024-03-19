/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
import {
  AccountUpdate,
  SmartContract,
  UInt64,
  PublicKey,
  method,
  state,
  State,
  DeployArgs,
  Int64,
} from 'o1js';

import Token from '../src/token';
import Depositable from '../src/interfaces/tokenAccount/depositable';
import Withdrawable from '../src/interfaces/tokenAccount/withdrawable';

class ThirdParty extends SmartContract implements Depositable, Withdrawable {
  @state(PublicKey) ownerAddress = State<PublicKey>();

  public get tokenOwner() {
    this.ownerAddress.requireEquals(this.ownerAddress.get());
    if(!this.ownerAddress.get()) {
      throw new Error('Token owner address has not been set')
    }
    return new Token(this.ownerAddress.get())
  }

  deploy(args: DeployArgs & {ownerAddress: PublicKey}) {
    super.deploy(args);
    this.ownerAddress.set(args.ownerAddress);
  }

  @method
  public deposit(amount: UInt64): AccountUpdate {
    const accountUpdate = AccountUpdate.create(this.address, this.tokenOwner.deriveTokenId());
    accountUpdate.balanceChange = Int64.fromUnsigned(amount);
    return accountUpdate;
  }

  @method public withdraw(amount: UInt64): AccountUpdate {
    const token = this.tokenOwner;
    const accountUpdate = AccountUpdate.create(this.address, this.tokenOwner.deriveTokenId());
    accountUpdate.balanceChange = Int64.fromUnsigned(amount).neg();
    accountUpdate.requireSignature();
    return accountUpdate;
  }
}

export default ThirdParty;
