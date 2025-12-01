
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

export type TopVoteResults = {
   top_categories: VoteTally[];
   total_votes: number;
}


export type VoteTally = {
    category_code: string;
    category_name : string;
    count: number;
}