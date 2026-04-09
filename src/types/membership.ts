export type OrgRole = 'OWNER' | 'ADMIN' | 'RECEPTION' | 'CAN_GET_ALERTS' | 'CAN_ACCEPT' | 'CAN_CHECKIN' | 'CAN_COUNTER' | 'EMPLOYEE';

export type MembershipStatus = 'active' | 'inactive' | 'pending_verification' | 'pending_deletion' | 'blocked';

export interface OrgMembership {
  _id: string;
  userId: string;
  orgId: string;
  roles: OrgRole[];
  status: MembershipStatus;
  invitedBy: string | null;
  createdAt: string;
  updatedAt: string;
}
