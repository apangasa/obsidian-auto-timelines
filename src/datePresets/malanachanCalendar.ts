import {
	createNumberDateTokenConfiguration,
	createStringDateTokenConfiguration,
} from "~/utils";
import { Condition } from "~/types";

import type { DateFormatCreationFunction } from "~/types";

export const malanachanCalendarDatePreset: DateFormatCreationFunction = ({ t }) => ({
	name: "malanachan-calendar",
	icon: "calendar",
	settings: {
		dateDisplayFormat: "{day} {week} {cycle} {year}",
		dateParserGroupPriority: "year,cycle,week,day",
		dateParserRegex: "(?<year>-?[0-9]+)(?:[/-](?<cycle>[1-3]))?(?:[/-](?<week>[1-9]|1[0-3]))?(?:[/-](?<day>[1-8]))?",
		applyAdditonalConditionFormatting: true,
		dateTokenConfiguration: [
			createNumberDateTokenConfiguration({
				name: "year",
				minLength: 1,
			}),
			createStringDateTokenConfiguration({
				name: "cycle",
				dictionary: [
					"",
					t("cycles.empriclus"),
					t("cycles.apiclus"),
					t("cycles.finiclus"),
				],
			}),
			createStringDateTokenConfiguration({
				name: "week",
				dictionary: [
					"",
					t("weeks.eribrus") + ",",
					t("weeks.valebrus") + ",",
					t("weeks.andrebrus") + ",",
					t("weeks.sigurbrus") + ",",
					t("weeks.marbrus") + ",",
					t("weeks.susabris") + ",",
					t("weeks.melubris") + ",",
					t("weeks.jabrus") + ",",
					t("weeks.vinzebrus") + ",",
					t("weeks.leobrus") + ",",
					t("weeks.cecibris") + ",",
					t("weeks.talebris") + ",",
					t("weeks.volcebrus") + ","
				],
			}),
			createNumberDateTokenConfiguration({
				name: "day",
				minLength: 1,
				formatting: [
					{
						conditionsAreExclusive: true,
						evaluations: [
							{ condition: Condition.Equal, value: 0 },
						],
						format: "",
					},
					{
						conditionsAreExclusive: true,
						evaluations: [
							{ condition: Condition.Equal, value: 1 },
						],
						format: "{value}st",
					},
					{
						conditionsAreExclusive: true,
						evaluations: [
							{ condition: Condition.Equal, value: 2 },
						],
						format: "{value}nd",
					},
					{
						conditionsAreExclusive: true,
						evaluations: [
							{ condition: Condition.Equal, value: 3 },
						],
						format: "{value}rd",
					},
					{
						conditionsAreExclusive: true,
						evaluations: [
							{ condition: Condition.Greater, value: 3 },
						],
						format: "{value}th",
					},
				],
			}),
			// createNumberDateTokenConfiguration({
			// 	name: "circa",
			// 	dictionary: [
			// 		"",
			// 		"c. "
			// 	],
			// })
		],
	},
});
