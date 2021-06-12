import {
  Approval as ApprovalEvent,
  Transfer as TransferEvent,
  NU as TokenContract
} from "../generated/NU/NU"
import { Approval, Transfer, User } from "../generated/schema"

import { store, BigInt } from '@graphprotocol/graph-ts'

export function handleApproval(event: ApprovalEvent): void {
  let entity = new Approval(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.owner = event.params.owner
  entity.spender = event.params.spender
  entity.value = event.params.value
  entity.save()
}

export function handleTransfer(event: TransferEvent): void {
  let entity = new Transfer(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.from = event.params.from
  entity.to = event.params.to
  entity.value = event.params.value
  entity.save()

  let nuContract = TokenContract.bind(event.address)
  let from_balance = nuContract.balanceOf(event.params.from)
  let to_balance = nuContract.balanceOf(event.params.to)

  // if balance is nonzero update user entity
  let bigzero = new BigInt(0)
  if ( BigInt.compare(from_balance, bigzero) == 1 ){
    let fromUser = User.load(event.params.from.toHexString())
    if (!fromUser) {
      fromUser = new User(event.params.from.toHexString())
    }

    fromUser.balance = from_balance
    fromUser.save();
  }

  if ( BigInt.compare(to_balance, bigzero) == 1 ){
    let toUser = User.load(event.params.to.toHexString())
    if (!toUser) {
      toUser = new User(event.params.to.toHexString())
    }

    toUser.balance = to_balance
    toUser.save();
  }

}
