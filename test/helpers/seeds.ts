import { getManager } from 'typeorm'
import { UserSeed, User } from '../../src/db/entities/user'
import { Transaction, TxSeed, TransactionType, BorkTxSeed, ProfileTxSeed, CommentTxSeed, ReborkTxSeed, LikeTxSeed, ExtensionTxSeed, FollowTxSeed, UnfollowTxSeed, BlockTxSeed, UnblockTxSeed, FlagTxSeed } from '../../src/db/entities/transaction'
import { randomAddressOrTxid } from './random-generators'
import BigNumber from 'bignumber.js'

function getTxSeed (type: TransactionType, sender: User): TxSeed {

  return {
    createdAt: new Date(),
    txid: randomAddressOrTxid(false),
    nonce: 0,
    type,
    fee: new BigNumber(1),
    value: new BigNumber(0),
    sender,
  }
}

function getUserSeed (): UserSeed {
  return {
    createdAt: new Date(),
    address: randomAddressOrTxid(),
    birthBlock: Math.floor(Math.random() * 2000001),
  }
}

export async function seedBaseUser (attributes: Partial<UserSeed> = {}) {
  const seed: UserSeed = Object.assign(getUserSeed(), attributes)

  const user = getManager().create(User, seed)
  return getManager().save(user)
}

export async function seedFullUser (attributes: Partial<UserSeed> = {}) {
  const seed: UserSeed = {
    ...getUserSeed(),
    name: 'name',
    bio: 'biography',
    avatarLink: 'https://fakeAvatarURL.com',
  }

  const user = getManager().create(User, Object.assign(seed, attributes))
  return getManager().save(user)
}

export async function seedBorkTx (sender: User, attributes: Partial<BorkTxSeed> = {}) {
  const seed: BorkTxSeed = {
    ...getTxSeed(TransactionType.bork, sender),
    content: 'bork content',
  }

  const transaction = getManager().create(Transaction, Object.assign(seed, attributes))

  return getManager().save(transaction)
}

export async function seedEntensionTx (sender: User, parent: Transaction, attributes: Partial<ExtensionTxSeed> = {}) {
  const seed: ExtensionTxSeed = {
    ...getTxSeed(TransactionType.extension, sender),
    content: 'child content',
    parent,
  }

  const transaction = getManager().create(Transaction, Object.assign(seed, attributes))

  return getManager().save(transaction)
}

export async function seedCommentTx (sender: User, parent: Transaction, attributes: Partial<CommentTxSeed> = {}) {
  const seed: CommentTxSeed = {
    ...getTxSeed(TransactionType.comment, sender),
    content: 'comment content',
    parent,
  }

  const transaction = getManager().create(Transaction, Object.assign(seed, attributes))

  return getManager().save(transaction)
}

export async function seedReborkTx (sender: User, parent: Transaction, attributes: Partial<ReborkTxSeed> = {}) {
  const seed: ReborkTxSeed = {
    ...getTxSeed(TransactionType.rebork, sender),
    content: null,
    parent,
  }

  const transaction = getManager().create(Transaction, Object.assign(seed, attributes))

  return getManager().save(transaction)
}

export async function seedLikeTx (sender: User, parent: Transaction, attributes: Partial<LikeTxSeed> = {}) {
  const seed: LikeTxSeed = {
    ...getTxSeed(TransactionType.like, sender),
    parent,
  }

  const transaction = getManager().create(Transaction, Object.assign(seed, attributes))

  return getManager().save(transaction)
}

export async function seedFlagTx (sender: User, parent: Transaction, attributes: Partial<FlagTxSeed> = {}) {
  const seed: FlagTxSeed = {
    ...getTxSeed(TransactionType.flag, sender),
    parent,
  }

  const transaction = getManager().create(Transaction, Object.assign(seed, attributes))

  return getManager().save(transaction)
}

export async function seedFollowTx (followed: User, follower: User, attributes: Partial<FollowTxSeed> = {}) {
  const seed: FollowTxSeed = {
    ...getTxSeed(TransactionType.follow, follower),
    content: followed.address,
  }

  const transaction = getManager().create(Transaction, Object.assign(seed, attributes))

  return getManager().save(transaction)
}

export async function seedUnfollowTx (sender: User, user: User, attributes: Partial<UnfollowTxSeed> = {}) {
  const seed: UnfollowTxSeed = {
    ...getTxSeed(TransactionType.unfollow, sender),
    content: user.address,
  }

  const transaction = getManager().create(Transaction, Object.assign(seed, attributes))

  return getManager().save(transaction)
}

export async function seedBlockTx (sender: User, user: User, attributes: Partial<BlockTxSeed> = {}) {
  const seed: BlockTxSeed = {
    ...getTxSeed(TransactionType.block, sender),
    content: user.address,
  }

  const transaction = getManager().create(Transaction, Object.assign(seed, attributes))

  return getManager().save(transaction)
}

export async function seedUnblockTx (sender: User, user: User, attributes: Partial<UnblockTxSeed> = {}) {
  const seed: UnblockTxSeed = {
    ...getTxSeed(TransactionType.unblock, sender),
    content: user.address,
  }

  const transaction = getManager().create(Transaction, Object.assign(seed, attributes))

  return getManager().save(transaction)
}

export async function seedProfileTx (sender: User, type: TransactionType = TransactionType.setName, attributes: Partial<ProfileTxSeed> = {}) {
  let content: string
  switch (type) {
    case TransactionType.setName:
      content = 'name'
      break
    case TransactionType.setBio:
      content = 'biography'
      break
    case TransactionType.setAvatar:
      content = 'https://fakeAvatarURL.com'
      break
  }

  const seed: ProfileTxSeed = {
    ...getTxSeed(type, sender),
    content,
  }

  const transaction = getManager().create(Transaction, Object.assign(seed, attributes))

  return getManager().save(transaction)
}