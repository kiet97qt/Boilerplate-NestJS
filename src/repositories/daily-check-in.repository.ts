import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

// INNER
import {
	DailyCheckIn,
	DailyCheckInDocument,
} from '@modules/daily-check-in/entities/daily-check-in.entity';
import { DailyCheckInRepositoryInterface } from '@modules/daily-check-in/interfaces/daily-check-in.interface';
import { CheckInData } from '@modules/daily-check-in/entities/check-in-data.entity';

// OUTER
import { BaseRepositoryAbstract } from './base/base.abstract.repository';

@Injectable()
export class DailyCheckInRepository
	extends BaseRepositoryAbstract<DailyCheckInDocument>
	implements DailyCheckInRepositoryInterface
{
	constructor(
		@InjectModel(DailyCheckIn.name)
		private readonly daily_check_in_model: Model<DailyCheckInDocument>,
	) {
		super(daily_check_in_model);
	}

	async increaseAccessAmount(user_id: string, check_in_date: Date) {
		try {
			return await this.daily_check_in_model.findOneAndUpdate(
				{
					user: user_id,
					month_year: `${
						check_in_date.getMonth() + 1
					}-${check_in_date.getFullYear()}`,
					'check_in_data.checked_date': check_in_date,
				},
				{
					$inc: {
						'check_in_data.$.access_amount': 1,
					},
				},
				{
					new: true,
				},
			);
		} catch (error) {
			throw error;
		}
	}

	async addCheckInData(user_id: string, check_in_date: Date) {
		try {
			return await this.daily_check_in_model.findOneAndUpdate(
				{
					user: user_id,
					month_year: `${
						check_in_date.getMonth() + 1
					}-${check_in_date.getFullYear()}`,
				},
				{
					$push: {
						check_in_data: {
							eligible_for_reward: true,
							checked_date: check_in_date,
						} as CheckInData,
					},
				},
				{
					new: true,
					upsert: true,
				},
			);
		} catch (error) {
			throw error;
		}
	}
}