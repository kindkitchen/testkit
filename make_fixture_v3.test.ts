import { verify } from "node:crypto";
import { make_fixture } from "./make_fixture_v3.ts";
import { expect } from "@std/expect";

type User = {
  name: string;
};
type UserTag = "all" | "men" | "women" | "verified" | "unverified";
const data = {
  alex: {
    fixture: { name: "alex" },
    tags: ["all", "men", "verified"] as UserTag[],
  },
  nik: { fixture: { name: "nik" }, tags: ["all", "men"] as UserTag[] },
  kate: {
    fixture: { name: "kate" },
    tags: ["all", "women", "verified"] as UserTag[],
  },
};
Deno.test("make_fixture (v3)", async (t) => {
  await t.step("make_fixture should be invoked without errors", async (tt) => {
    const fixture = make_fixture
      .start_builder_chain
      .for_data_type<User>()
      .with_possible_tags<UserTag>()
      .data_can_be_transformed_into_such_views({
        it_is: (d) => d,
      })
      .build(data);

    await tt.step(
      "fixtures should be correctly distributed across the tags",
      async (ttt) => {
        await ttt.step("<all> tags should include all fixtures", () => {
          const all = fixture.many_with_tag("all").as.it_is();
          expect(all()).toContainEqual(data.alex.fixture);
          expect(all()).toContainEqual(data.nik.fixture);
          expect(all()).toContainEqual(data.kate.fixture);
        });
        await ttt.step(
          "<men> tags should include both alex and nik",
          () => {
            const men = fixture.many_with_tag("men").as.it_is();
            expect(men().length).toBe(2);
            expect(men()).toContainEqual(data.alex.fixture);
            expect(men()).toContainEqual(data.nik.fixture);
          },
        );
        await ttt.step(
          "<men> tags should NOT include kate",
          () => {
            const men = fixture.many_with_tag("men").as.it_is();
            expect(men().length).toBe(2);
            expect(men()).not.toContainEqual(data.kate.fixture);
          },
        );
      },
    );
    await tt.step(
      "fixtures should be correctly reorganized after dynamic ad/remove to/from tags",
      async (ttt) => {
        const unverified = fixture.many_with_tag("unverified").as.it_is();
        await ttt.step("<unverified> should be empty", () => {
          expect(unverified().length).toBe(0);
        });
        await ttt.step("kate should be appeared in <unverified>", () => {
          fixture.one_by_name("kate").add_to_more_tags(
            "unverified",
          );
        });
        await ttt.step("<unverified> should contain kate", () => {
          const kate = fixture.one_by_name("kate").as.it_is();
          expect(unverified()).toContainEqual(kate());
        });
      },
    );
  });
});
