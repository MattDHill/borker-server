import { GET, Path, PathParam, QueryParam, HeaderParam, Errors } from 'typescript-rest'
import { getRepository, FindManyOptions } from 'typeorm'
import { User } from '../../db/entities/user'
import { checkBlocked, iFollowBlock } from '../../util/functions'
import { OrderBy, ApiUser, Utxo } from '../../util/types'
import { Bork } from '../../db/entities/bork'
import { BorkType } from 'borker-rs-node'
import { Client } from '../../util/client'

@Path('/users')
export class UserHandler {

  constructor (
    private readonly client: Client = new Client(),
  ) {}

	@Path('/')
	@GET
	async index (
    @HeaderParam('my-address') myAddress: string,
    @QueryParam('order') order: OrderBy<User> = { birthBlock: 'ASC' },
    @QueryParam('page') page: string | number = 1,
    @QueryParam('perPage') perPage: string | number = 20,
  ): Promise<ApiUser[]> {

    page = Number(page)
    perPage = Number(perPage)

    if (perPage > 40) { throw new Errors.BadRequestError('perPage limit is 40') }

    let options: FindManyOptions<User> = {
      take: perPage,
      skip: perPage * (page - 1),
      order,
    }
    const users = await getRepository(User).find(options)

    return Promise.all(users.map(async user => {
      return {
        ...user,
        ...await iFollowBlock(myAddress, user.address),
      }
    }))
  }

	@Path('/:address')
	@GET
	async get (
    @HeaderParam('my-address') myAddress: string,
    @PathParam('address') address: string,
  ): Promise<ApiUser> {

    const [user, blocked, counts, iStuff] = await Promise.all([
      getRepository(User).findOne(address),
      checkBlocked(myAddress, address),
      this.getCounts(address),
      iFollowBlock(myAddress, address),
    ])

    if (!user) {
      throw new Errors.NotFoundError('user not found')
    }
    if (blocked) {
      throw new Errors.NotAcceptableError('blocked')
    }

    return {
      ...user,
      ...counts,
      ...iStuff,
    }
  }

	@Path('/:address/balance')
	@GET
	async getBalance (@PathParam('address') address: string): Promise<number> {
    return this.client.getBalance(address)
  }

	@Path('/:address/utxos')
	@GET
	async getUtxos (
    @PathParam('address') address: string,
    @QueryParam('amount') amount: number,
    @QueryParam('batchSize') batchSize: number = 100,
  ): Promise<Utxo[]> {
    return this.client.getUtxos(address, amount, batchSize)
  }

	@Path('/:address/users')
	@GET
	async indexFollows (
    @HeaderParam('my-address') myAddress: string,
    @PathParam('address') address: string,
    @QueryParam('type') type: 'following' | 'followers',
    @QueryParam('order') order: OrderBy<User> = { createdAt: 'ASC' },
    @QueryParam('page') page: string | number = 1,
    @QueryParam('perPage') perPage: string | number = 20,
  ): Promise<ApiUser[]> {

    page = Number(page)
    perPage = Number(perPage)

    if (perPage > 40) { throw new Errors.BadRequestError('perPage limit is 40') }

    Object.keys(order).forEach(key => {
      const newkey = `users.${key}`
      order[newkey] = order[key]
      delete order[key]
    })

    let query = getRepository(User)
      .createQueryBuilder('users')
      .where(qb => {
        let subquery = qb.subQuery()
          .from(Bork, 'borks')
          .where('type = :type', { type: BorkType.Follow })

        if (type === 'following') {
          subquery.select('recipient_address')
          subquery.andWhere('sender_address = :address')
        } else if (type === 'followers') {
          subquery.select('sender_address')
          subquery.andWhere('recipient_address = :address')
        } else {
          throw new Errors.BadRequestError('query param "type" must be "following" or "followers"')
        }

        return `address IN ${subquery.getQuery()}`
      })
      .orderBy(order as any)
      .take(perPage)
      .offset(perPage * (page - 1))
      .setParameter('address', address)

    const [blocked, users] = await Promise.all([
      checkBlocked(myAddress, address),
      query.getMany(),
    ])

    if (blocked) {
      throw new Errors.NotAcceptableError('blocked')
    }

    return Promise.all(users.map(async user => {
      return {
        ...user,
        ...await iFollowBlock(myAddress, user.address),
      }
    }))
  }

  private async getCounts (address: string): Promise<{
    followersCount: number
    followingCount: number
  }> {

    const conditions = {
      type: BorkType.Follow,
    }

    const [ followersCount, followingCount ] = await Promise.all([
      getRepository(Bork).count({ ...conditions, recipient: { address } }),
      getRepository(Bork).count({ ...conditions, sender: { address } }),
    ])

    return { followersCount, followingCount }
  }
}
