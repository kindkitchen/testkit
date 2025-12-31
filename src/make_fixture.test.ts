import { make_fixture } from "./make_fixture.ts";
import { expect } from "@std/expect";

type User = {
  id: string;
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
  await t.step("make_fixture should be invoked without errors", async (t) => {
    const fixture = make_fixture
      .start_builder_chain
      .for_data_type<User>()
      .with_possible_tags<UserTag>()
      .data_can_be_transformed_into_such_views({
        it_is: (d) => d,
        with_fake_uuid: (d, uuid: string) => ({ ...d, uuid }),
      })
      .build(data);

    await t.step(
      "fixtures should be correctly distributed across the tags",
      async (t) => {
        await t.step("<all> tags should include all fixtures", () => {
          const all = fixture.many_with_tag("all").as.it_is();
          expect(all()).toContainEqual(data.alex.fixture);
          expect(all()).toContainEqual(data.nik.fixture);
          expect(all()).toContainEqual(data.kate.fixture);
        });
        await t.step(
          "<men> tags should include both alex and nik",
          () => {
            const men = fixture.many_with_tag("men").as.it_is();
            expect(men().length).toBe(2);
            expect(men()).toContainEqual(data.alex.fixture);
            expect(men()).toContainEqual(data.nik.fixture);
          },
        );
        await t.step(
          "<men> tags should NOT include kate",
          () => {
            const men = fixture.many_with_tag("men").as.it_is();
            expect(men().length).toBe(2);
            expect(men()).not.toContainEqual(data.kate.fixture);
          },
        );
      },
    );
    await t.step(
      "fixtures should be correctly reorganized after dynamic add/remove to/from tags",
      async (t) => {
        const unverified = fixture.many_with_tag("unverified").as.it_is();
        await t.step("<unverified> should be empty", () => {
          expect(unverified().length).toBe(0);
        });
        const kate = fixture.one_by_name("kate");
        await t.step("kate should be appeared in <unverified>", () => {
          kate.add_to_more_tags(
            "unverified",
          );
        });
        await t.step("<unverified> should contain kate", () => {
          expect(unverified()).toContainEqual(kate.as.it_is()());
        });
        await t.step("kate should be disappeared from <unverified>", () => {
          kate.remove_from_tags("unverified");
        });
        await t.step("<unverified> should become empty again", () => {
          expect(unverified().length).toBe(0);
        });
      },
    );
    await t.step(
      "representation functions should work correctly",
      async (t) => {
        await t.step(
          "data to view transformation function should not affect data-source",
          () => {
            const alex = fixture.one_by_name("alex").as.it_is();
            const alex_with_uuid = fixture.one_by_name("alex").as
              .with_fake_uuid(crypto.randomUUID());
            expect(alex_with_uuid()).toHaveProperty("uuid");
            expect(alex()).not.toHaveProperty("uuid");
          },
        );
        await t.step(
          "updates on data-source should affect views",
          async (t) => {
            const nik = fixture.one_by_name("nik");
            const nik_as_it_is = nik.as.it_is();
            await t.step("nik should not have <id> yet", () => {
              expect(typeof nik_as_it_is().id).toBe("undefined");
            });
            await t.step("do update of nik's data-source with <id>", () => {
              nik.update_data_source((d) => ({
                ...d,
                id: crypto.randomUUID(),
              }));
            });
            await t.step("nik should have <id>", () => {
              expect(typeof nik_as_it_is().id).toBe("string");
            });
          },
        );
      },
    );
  });
});
