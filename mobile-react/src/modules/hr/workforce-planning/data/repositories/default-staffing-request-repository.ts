import type { StaffingRequestRepository } from '../../domain/repositories/staffing-request-repository';
import { staffingRemoteDataSource } from '../remote/staffing-remote-data-source';
export class DefaultStaffingRequestRepository implements StaffingRequestRepository {
  constructor(private readonly remote = staffingRemoteDataSource) {}
  getPage: StaffingRequestRepository['getPage'] = (query) => this.remote.getRequests(query);
  getById: StaffingRequestRepository['getById'] = (id) => this.remote.getRequest(id);
  create: StaffingRequestRepository['create'] = (request) => this.remote.createRequest(request);
  submit: StaffingRequestRepository['submit'] = (action) => this.remote.submitRequest(action);
  approve: StaffingRequestRepository['approve'] = (action) => this.remote.approveRequest(action);
  reject: StaffingRequestRepository['reject'] = (action) => this.remote.rejectRequest(action);
  close: StaffingRequestRepository['close'] = (action) => this.remote.closeRequest(action);
}
