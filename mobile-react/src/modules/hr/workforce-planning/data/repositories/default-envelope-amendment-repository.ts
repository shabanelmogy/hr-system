import type { EnvelopeAmendmentRepository } from '../../domain/repositories/envelope-amendment-repository';
import { staffingRemoteDataSource } from '../remote/staffing-remote-data-source';
export class DefaultEnvelopeAmendmentRepository implements EnvelopeAmendmentRepository {
  constructor(private readonly remote = staffingRemoteDataSource) {}
  getPage: EnvelopeAmendmentRepository['getPage'] = (query) => this.remote.getAmendments(query);
  getById: EnvelopeAmendmentRepository['getById'] = (id) => this.remote.getAmendment(id);
  create: EnvelopeAmendmentRepository['create'] = (request) => this.remote.createAmendment(request);
  submit: EnvelopeAmendmentRepository['submit'] = (action) => this.remote.submitAmendment(action);
  approve: EnvelopeAmendmentRepository['approve'] = (action) => this.remote.approveAmendment(action);
  reject: EnvelopeAmendmentRepository['reject'] = (action) => this.remote.rejectAmendment(action);
}
