
export type DBVote = {
    choice_id: string;
    free_text?: string;
}


export type DisplayVote = {
    category: string;
    category_code: string;
    subcategory: string;
    subcategory_code: string;
    additional_note?: string;
}