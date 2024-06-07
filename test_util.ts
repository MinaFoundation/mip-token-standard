import { Mina, PrivateKey } from "o1js"

/** Creates a {@link TestPublicKey} that does not have an account on the chain yet.
 * This is used for non-min accounts
 */
export function newTestPublicKey(): Mina.TestPublicKey {
  const keyPair = PrivateKey.randomKeypair()
  let pubKey = keyPair.publicKey as Mina.TestPublicKey
  pubKey.key = keyPair.privateKey
  return pubKey
}

export function newTestPublicKeys<N extends number>(n: N): ArrayOfLength<Mina.TestPublicKey, N> {
  return Array.from({ length: n }, () => newTestPublicKey()) as ArrayOfLength<
    Mina.TestPublicKey,
    N
  >
}

type ArrayOfLength<T, L extends number, A extends T[] = []> = number extends L ? T[]
  : L extends A["length"] ? A
  : ArrayOfLength<T, L, [...A, T]>
