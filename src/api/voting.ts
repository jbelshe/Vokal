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



export async function loadCategoriesAll() : Promise<{ categoriesData: CategoryWithSubcategories[], categoryMap: CategoryMap }> {
    console.log("Loading Categories...")
    const { data, error } = await supabase.from('property_categories')
        .select(`
        id,
        name,
        code,
        index_order,
        description,
        property_subcategories!inner(
          category_id,
          code,
          name
        )
        `)
        .order('index_order', { ascending: true })
        .order('index_order', { referencedTable: 'property_subcategories', ascending: true });
    // console.log("Subcategories Data:", data);
    if (error) throw error;

    const categoryMap: CategoryMap = {};
    const categoriesData: CategoryWithSubcategories[] = data.map((category) => ({
        id: category.index_order,
        name: category.name,
        description: category.description,
        code: category.code,
        subcategories: category.property_subcategories
    }));
    // console.log("CAT DATA:", categoriesData)

    
    data?.forEach(category => {
        categoryMap[category.name] = category.property_subcategories.map(sub => ({
        name: sub.name,
        category_id: sub.category_id,
        code: sub.code
        }));
    });
    // console.log("Category Map:", categoryMap)
    // console.log("Categories Data:", categoriesData)
    return { categoriesData, categoryMap };
}