import { supabase } from "../lib/supabase";
import { Subcategory, CategoryWithSubcategories, CategoryMap } from "../types/categories";
import { useAppContext } from "../context/AppContext";




export async function getCategories() : Promise<string[]> {
    const { data, error } = await supabase.from('property_categories')
        .select(`*`)
        .order('name', { ascending: true });
    console.log("Categories Data:", data);
    if (error) throw error;
    const categories = data.map((category) => category.name);
    console.log(categories)
    return categories;
}



export async function loadCategoriesAll() : Promise<{ 
    categoriesDataMap: Record<string, CategoryWithSubcategories>, 
    categoryToSubcategoryMap: CategoryMap, 
    subcategoryToIdMap: Record<string, string>, 
    idToCategoryMap: Record<string, { code: string; name: string }> 
    subcategoryToCategoryMap: Record<string, string>
}> {
    console.log("Loading Categories...")
    const { data, error } = await supabase.from('property_categories')
        .select(`
        id,
        name,
        code,
        index_order,
        description,
        property_subcategories!inner(
          id,
          code,
          name
        )
        `)
        .order('index_order', { ascending: true })
        .order('index_order', { referencedTable: 'property_subcategories', ascending: true });
    console.log("Subcategories Data:", data);
    if (error) throw error;


    const subcategoryToIdMap: Record<string, string> = {};  // maps subcategory code to subcategory id
    const idToCategoryMap: Record<string, { code: string; name: string }> = {}; // maps category id to category code and name
    const categoriesDataMap: Record<string, CategoryWithSubcategories> = {}; // maps category code to data about category's subcategories
    const categoryToSubcategoryMap: CategoryMap = {}; // maps category code to subcategories
    const subcategoryToCategoryMap: Record<string, string> = {}; // maps subcategory code to category code

    
    for (const category of data) {
        idToCategoryMap[category.id] = { code: category.code, name: category.name };
        categoriesDataMap[category.code] = {
            id: category.index_order,
            name: category.name,
            description: category.description,
            code: category.code,
            subcategories: category.property_subcategories
        };
        categoryToSubcategoryMap[category.code] = category.property_subcategories;
        category.property_subcategories.forEach(sub => {
            subcategoryToIdMap[sub.code] = sub.id;
            idToCategoryMap[sub.id] = { code: sub.code, name: sub.name };
            subcategoryToCategoryMap[sub.code] = category.code;
        });
    }


    console.log("categoriesDataMap", categoriesDataMap)
    console.log("categoryToSubcategoryMap", categoryToSubcategoryMap)
    console.log("subcategoryToIdMap", subcategoryToIdMap)
    console.log("idToCategoryMap", idToCategoryMap)
    console.log("subcategoryToCategoryMap", subcategoryToCategoryMap)
    return { categoriesDataMap, categoryToSubcategoryMap, subcategoryToIdMap, idToCategoryMap, subcategoryToCategoryMap };
}



export async function submitVote(user_id : string, property_id : string, subcategory_choice: string, note: string)  : Promise<boolean>{
    
    const payload = {
        property_id,
        user_id,
        choice: subcategory_choice,
        free_text: note,
    }
    console.log("Submitting vote...");
    console.log("Payload:", payload);
    try {
        const { data, error } = await supabase.from('votes').insert(payload)
        if (error) throw error;
        console.log("Vote submitted successfully!", data)
        return true;
    } catch (error) {
        console.error("Error submitting vote:", error);
        return false;
    }
}
