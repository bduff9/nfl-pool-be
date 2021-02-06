import { ObjectType, Field, Int } from 'type-graphql';
import {
	BaseEntity,
	Column,
	CreateDateColumn,
	DeleteDateColumn,
	Entity,
	Index,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

@Index('uk_SystemValue', ['systemValueName', 'systemValueValue'], {
	unique: true,
})
@Entity('SystemValues', { schema: 'NFL' })
@ObjectType()
export class SystemValue extends BaseEntity {
	@Field(() => Int, { nullable: false })
	@PrimaryGeneratedColumn({
		type: 'integer',
		name: 'SystemValueID',
		unsigned: false,
	})
	public systemValueID!: number;

	@Field(() => String, { nullable: false })
	@Column({
		length: 20,
		name: 'SystemValueName',
		nullable: false,
		type: 'varchar',
	})
	public systemValueName!: string;

	@Field(() => String, { nullable: true })
	@Column({
		default: null,
		length: 99,
		name: 'SystemValueValue',
		nullable: true,
		type: 'varchar',
	})
	public systemValueValue!: null | string;

	@Field(() => Date, { nullable: false })
	@CreateDateColumn({
		default: () => 'CURRENT_TIMESTAMP',
		name: 'SystemValueAdded',
		nullable: false,
		precision: null,
		type: 'timestamp',
		update: false,
	})
	public systemValueAdded!: Date;

	@Field(() => String, { nullable: false })
	@Column({
		length: 50,
		name: 'SystemValueAddedBy',
		nullable: false,
		type: 'varchar',
		update: false,
	})
	public systemValueAddedBy!: string;

	@Field(() => Date, { nullable: false })
	@UpdateDateColumn({
		default: () => 'CURRENT_TIMESTAMP',
		name: 'SystemValueUpdated',
		nullable: false,
		onUpdate: 'CURRENT_TIMESTAMP',
		precision: null,
		type: 'timestamp',
	})
	public systemValueUpdated!: Date;

	@Field(() => String, { nullable: false })
	@Column('varchar', {
		length: 50,
		name: 'SystemValueUpdatedBy',
		nullable: false,
	})
	public systemValueUpdatedBy!: string;

	@DeleteDateColumn({
		default: null,
		insert: false,
		name: 'SystemValueDeleted',
		nullable: true,
		precision: null,
		select: false,
		type: 'timestamp',
	})
	public systemValueDeleted!: Date;

	@Column({
		default: null,
		insert: false,
		length: 50,
		name: 'SystemValueDeletedBy',
		nullable: true,
		select: false,
		type: 'varchar',
	})
	public systemValueDeletedBy!: null | string;
}
