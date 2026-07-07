import { supabase } from "@services/supabase.js";

export const CategoryService = {
  async getAll({ type = null } = {}) {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    if (!userId) {
      throw new Error("Authentication required");
    }

    let query = supabase
      .from("categories")
      .select("*")
      .eq("user_id", userId)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (type) {
      query = query.eq("type", type);
    }

    console.log("Fetching categories for user:", userId);

    const { data, error } = await query;

    if (error) {
      console.error("CategoryService.getAll error:", error);
      return [];
    }

    console.log("Categories loaded:", data?.length, "items");
    if (data?.length > 0) {
      console.log("Sample category:", data[0]);
    } else {
      console.warn(
        'NO CATEGORIES FOUND - Run: SELECT create_default_categories("' +
          userId +
          '")',
      );
    }

    return data || [];
  },

  async getGrouped() {
    const categories = await this.getAll();
    console.log("Grouping categories:", categories?.length, "items");

    const grouped = {
      income: [],
      expense: [],
      transfer: [],
      debt: [],
      receivable: [],
      investment: [],
    };

    if (categories && categories.length > 0) {
      categories.forEach((cat) => {
        if (grouped[cat.type]) {
          grouped[cat.type].push(cat);
        }
      });
    }

    console.log("Grouped result:", {
      income: grouped.income.length,
      expense: grouped.expense.length,
      transfer: grouped.transfer.length,
      debt: grouped.debt.length,
      receivable: grouped.receivable.length,
      investment: grouped.investment.length,
    });

    return grouped;
  },

  async create(category) {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    const { data, error } = await supabase
      .from("categories")
      .insert({ ...category, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from("categories")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from("categories")
      .update({ is_active: false })
      .eq("id", id);

    if (error) throw error;
  },
};
