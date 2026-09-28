# Actors and access

## 1. Actors

| Actor | Goal | Frequency / volume | Device | Profile entity | Evidence |
| --- | --- | --- | --- | --- | --- |
| <<Actor>> | <<goal>> | <<daily, ~50 users>> | <<web/mobile>> | <<Customer / none>> | <<[stated]>> |

## 2. Tenant model

- **Tenant is:** <<school / company / branch / workspace>>
- **Users in several tenants:** <<yes/no>>
- **Tenant creation:** <<platform admin / self-service>>
- **Subscription / entitlements:** <<plans, user limits, feature ceilings>>
- **Global (shared) data:** <<none / list>>

## 3. Permission catalog

| Permission | Meaning | Default roles |
| --- | --- | --- |
| <<Resource.Action>> | <<what it allows>> | <<Admin, Manager>> |

## 4. Default roles

| Role | System role? | Member type | Purpose |
| --- | --- | --- | --- |
| <<Tenant Admin>> | yes | <<Staff>> | <<full tenant administration>> |

## 5. Resource scope matrix

| Actor | Resource | Read scope | Write scope | Rule |
| --- | --- | --- | --- | --- |
| <<Actor>> | <<Resource>> | <<all-in-tenant / own / related through X / none>> | <<…>> | <<BR-###>> |

## 6. IDOR policy

<<Out-of-scope IDs return 404 (default) or 403 — decision D-###>>

## 7. Field-level rules

| Resource.Field | Visible to | Editable by | Rule |
| --- | --- | --- | --- |
| — | — | — | — |

## 8. Sensitive actions

| Action | Control (confirmation / reason / dual approval / audit) | Rule |
| --- | --- | --- |
| — | — | — |
