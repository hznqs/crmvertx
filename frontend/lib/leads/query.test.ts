import { buildLeadQuery, toLeadSearchParams } from "@/lib/leads/query";

describe("lead query", () => {
  it("requests active leads by default so archived or converted leads stay hidden", () => {
    const query = buildLeadQuery({});
    const params = toLeadSearchParams(query);

    expect(query.active).toBe("true");
    expect(params.get("active")).toBe("true");
  });

  it("keeps explicit active filters for maintenance screens", () => {
    const query = buildLeadQuery({ active: "false" });

    expect(query.active).toBe("false");
  });
});
