import type { SystemLocalizationRepository } from '../../domain/repositories/system-localization-repository';
export class DefaultSystemLocalizationRepository implements SystemLocalizationRepository {
 constructor(private readonly remote:SystemLocalizationRepository,private readonly isOnline:()=>boolean){}
 private online(){if(!this.isOnline())throw new Error('System UI texts require a live connection.');}
 getSettings(){this.online();return this.remote.getSettings();}
 getTexts(query:Parameters<SystemLocalizationRepository['getTexts']>[0]){this.online();return this.remote.getTexts(query);}
 getRuntime(){this.online();return this.remote.getRuntime();}
 setText(request:Parameters<SystemLocalizationRepository['setText']>[0]){this.online();return this.remote.setText(request);}
 resetText(request:Parameters<SystemLocalizationRepository['resetText']>[0]){this.online();return this.remote.resetText(request);}
}
