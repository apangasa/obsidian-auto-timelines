import { getMetadataKey, isDefined, isOrderedSubArray } from "~/utils";

import type { MarkdownCodeBlockTimelineProcessingContext } from "~/types";
import {
	getAbstractDateFromMetadata,
	getBodyFromContextOrDocument,
	getImageUrlFromContextOrDocument,
	getTagsFromMetadataOrTagObject,
} from "./cardDataExtraction";

import { Parser } from "expr-eval";


/**
 * Provides additional context for the creation cards in the DOM.
 *
 * @param context - Timeline generic context.
 * @param tagsToFind - The timelines to find in a note to match the current timeline.
 * @returns the context or underfined if it could not build it.
 */
export async function getDataFromNoteMetadata(
	context: MarkdownCodeBlockTimelineProcessingContext,
	condition: string,
	tagsToFind: string[],
	notTags: string[]
) {
	const { cachedMetadata, settings } = context;
	const { frontmatter: metaData, tags } = cachedMetadata;

	if (!metaData) return undefined;
	if (metaData[settings.eventRenderToggleKey] !== true) return undefined;

	const timelineTags = getTagsFromMetadataOrTagObject(
		settings,
		metaData,
		tags
	);

	if (!extractedTagsAreValid(timelineTags, condition)) return undefined;

	return {
		cardData: await extractCardData(context),
		context,
	} as const;
}

/**
 * Checks if the extracted tags match at least one of the tags to find,
 * and ensures none of the noteTags are an ordered subarray of any notTags.
 *
 * @param noteTags - The extracted tags from the note.
 * @param tagsToFind - The tags to find for this timeline.
 * @param notTags - The tags that should not be included.
 * @returns `true` if valid.
 */
// export function extractedTagsAreValid(
// 	noteTags: string[],
// 	tagsToFind: string[],
// 	notTags: string[]
// ): boolean {
// 	// Split to account for Obsidian nested tags
// 	// https://help.obsidian.md/Editing+and+formatting/Tags#Nested+tags
// 	const noteTagCollection = noteTags.map((e) => e.split("/"));
// 	const notTagCollection = notTags.map((e) => e.split("/"));
// 	const tagsToFindCollection = tagsToFind.map((e) => e.split("/"));

// 	// Check if any noteTag is an ordered subarray of any notTag
// 	if (noteTagCollection.some((fileTag) => 
// 		notTagCollection.some((notTag) => isOrderedSubArray(fileTag, notTag))
// 	)) {
// 		return false;
// 	}

// 	// Check if any noteTag matches at least one of the tags to find
// 	return tagsToFindCollection.some((timelineTag) => 
// 		noteTagCollection.some((fileTag) => isOrderedSubArray(fileTag, timelineTag))
// 	);
// }

export function extractedTagsAreValid(
	noteTags: string[],
	condition: string
): boolean {
	const expression = convertToExprEvalSyntax(condition);
	console.log(expression);
	return evaluateExpression(expression, noteTags);
}


export function convertToExprEvalSyntax(input: string): string {
	// mainly we need to encode tags such that / is replaced with _
    return input
        .replace(/\bAND\b/g, "and")
        .replace(/\bOR\b/g, "or")
        .replace(/\bNOT\s*\(([^)]+)\)/g, (_, group) => {
            const terms = group.split(",").map(term => term.trim().replace(/\//g, "_"));
            return `not (${terms.join(" or ")})`;
        })
        .replace(/\b[a-zA-Z0-9_/]+\b/g, match => match.replace(/\//g, "_"));
}

export function evaluateExpression(expression: string, noteTags: string[]): boolean {
    const parser = new Parser();
    const parsedExpr = parser.parse(expression);

	const encodedTags = noteTags.map(tag => tag.replace(/\//g, "_"));
    const expandedTags = expandTags(encodedTags);

    const allVariables = parsedExpr.variables();
    const context: Record<string, number | boolean> = {};
    allVariables.forEach(variable => context[variable] = false);
    expandedTags.forEach(tag => context[tag] = true);

	console.log("Expression being evaluated:", expression);
    console.log("All detected variables:", allVariables);
    console.log("Context before evaluation:", context);

    return parsedExpr.evaluate(context as any);
}

export function expandTags(noteTags: string[]): string[] {
    const expandedTags = new Set<string>();

    noteTags.forEach(tag => {
        const parts = tag.split("_");
        for (let i = 1; i <= parts.length; i++) {
            expandedTags.add(parts.slice(0, i).join("_"));
        }
    });

    return Array.from(expandedTags);
}

/**
 * Get the content of a card from a note. This function will parse the raw text content of a note and format it.
 *
 * @param context - Timeline generic context.
 * @param rawFileContent - If you already have it, will avoid reading the file again.
 * @returns The extracted data to create a card from a note.
 */
export async function extractCardData(
	context: MarkdownCodeBlockTimelineProcessingContext,
	rawFileContent?: string
) {
	const { file, cachedMetadata: c, settings } = context;
	const fileTitle =
		c.frontmatter?.[settings.metadataKeyEventTitleOverride] ||
		file.basename;


	rawFileContent = rawFileContent || (await file.vault.cachedRead(file));
	return {
		title: fileTitle as string,
		body: getBodyFromContextOrDocument(rawFileContent, context),
		imageURL: getImageUrlFromContextOrDocument(rawFileContent, context),
		startDate: getAbstractDateFromMetadata(
			context,
			settings.metadataKeyEventStartDate
		),
		endDate:
			getAbstractDateFromMetadata(
				context,
				settings.metadataKeyEventEndDate
			) ??
			(isDefined(
				getMetadataKey(c, settings.metadataKeyEventEndDate, "boolean")
			)
				? true
				: undefined),
	} as const;
}
export type FnExtractCardData = typeof extractCardData;
