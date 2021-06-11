import {
  Approval as ApprovalEvent,
  Transfer as TransferEvent,
  NU as TokenContract
} from "../generated/NU/NU"
import { Approval, Transfer, User } from "../generated/schema"

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

  let fromUser = User.load(event.params.from.toHexString());
  if (!fromUser) {
    fromUser = new User(event.params.from.toHexString());
  }

  let toUser = User.load(event.params.to.toHexString());
  if (!toUser) {
    toUser = new User(event.params.to.toHexString());
  }

  let nuContract = TokenContract.bind(event.address)
  fromUser.balance = nuContract.balanceOf(event.params.from)
  toUser.balance = nuContract.balanceOf(event.params.to)

  fromUser.save();
  toUser.save();
}
