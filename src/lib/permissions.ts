import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

// delegate and define permissions depending on role

const statement = {
  ...defaultStatements,
  project: ["request", "approve", "order"],
} as const;

export const ac = createAccessControl(statement);

export const admin = ac.newRole({
  project: ["request", "approve", "order"],
  ...adminAc.statements,
});

export const user = ac.newRole({
  project: [],
  ...adminAc.statements,
});

export const farmer = ac.newRole({
  project: ["request"],
  ...adminAc.statements,
});

export const buyer = ac.newRole({
  project: ["order"],
  ...adminAc.statements,
});
