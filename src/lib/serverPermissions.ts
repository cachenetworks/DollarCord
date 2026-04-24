import type { MemberRole } from "@/types";

const rolePriority: Record<MemberRole, number> = {
  OWNER: 3,
  ADMIN: 2,
  MEMBER: 1,
};

export function canManageServer(role: MemberRole) {
  return role === "OWNER" || role === "ADMIN";
}

export function outranksRole(actorRole: MemberRole, targetRole: MemberRole) {
  return rolePriority[actorRole] > rolePriority[targetRole];
}

export function canChangeRole(actorRole: MemberRole, targetRole: MemberRole) {
  return actorRole === "OWNER" && targetRole !== "OWNER";
}

export function canRemoveMember(actorRole: MemberRole, targetRole: MemberRole) {
  return canManageServer(actorRole) && outranksRole(actorRole, targetRole);
}

export function canBanMember(actorRole: MemberRole, targetRole: MemberRole) {
  return canRemoveMember(actorRole, targetRole);
}
