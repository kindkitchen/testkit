import { make_fixture } from "./make_fixture_v2.ts";

Deno.test("make_fixture (v2) should work", async (t) => {
  await t.step("Should be created without errors", async (tt) => {
    const fixture = make_fixture<{
      id: string;
      name: string;
      make: "boy" | "girl";
    }, ["all", "boys", "girls"]>()(
      "The dictionary, which represent api to get unique fixture by some predicate:",
      {
        by_id: (data, id: string) => data.id === id,
      } as const,
      "The dictionary, which represent api, to compute specific representation of the data:",
      {
        compact: (d) => ({ id: d.id, name: d.name }),
      } as const,
      "Any amount of variants - ...[initial data, ...all labels with which it should be associated][]:",
      [{ id: "hmm" }, "all", "boys"] as const,
      [{ id: "TODO" }, "all", "girls"] as const,
    );

    console.log(fixture);
    await tt.step("Should be invoked without errors", () => {
      const hero = fixture.one_unique.by_id("TODO");
      console.log(hero?.as_state.compact());
      hero?.update_data_source((h) => ({ ...h, name: "hero" }));
      console.log(hero?.as_state.compact());
    });
  });
});
