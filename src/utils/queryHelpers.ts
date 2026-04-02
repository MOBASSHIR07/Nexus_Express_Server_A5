export const getQueryOptions = (query: Record<string, any>, searchableFields: string[]) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder || "desc";

  const searchTerm = query.searchTerm || "";

  const searchConditions = searchTerm
    ? {
        OR: searchableFields.map((field) => ({
          [field]: {
            contains: searchTerm,
            mode: "insensitive" as const,
          },
        })),
      }
    : {};

  return {
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
     searchConditions,
  };
};