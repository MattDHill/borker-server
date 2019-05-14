import {
	Column,
	Entity,
	PrimaryColumn,
  Index,
} from 'typeorm'

@Entity({ name: 'utxos' })
export class Utxo {

  // attributes
  
	@PrimaryColumn('text', { name: 'txid' })
  txid: string
  
	@PrimaryColumn('int', { name: 'index' })
	index: number

	@Column('datetime', { name: 'created_at' })
  createdAt: Date

  @Index()
	@Column('text', { name: 'address' })
  address: string

	@Column('bigint', { name: 'value' })
  value: number

	@Column('text', { name: 'raw' })
	raw: string
}

export interface UtxoSeed {
  txid: string
  index: number
  createdAt: Date
  address: string
  value: number
  raw: string
}
