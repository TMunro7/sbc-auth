<template>
  <div id="entity-management">
    <v-fade-transition>
      <div
        v-show="!!isLoading"
        class="loading-container grayed-out"
      >
        <v-progress-circular
          size="50"
          width="5"
          color="primary"
          :indeterminate="!!isLoading"
        />
      </div>
    </v-fade-transition>

    <v-container class="view-container justify">
      <div class="view-header align-center">
        <h1 class="view-header__title">
          {{ viewTitle }}<br>
          <span class="subtitle">{{ $t('myBusinessDashSubtitle') }}</span>
        </h1>
        <div class="view-header__actions">
          <v-btn
            id="add-name-request-btn"
            class="font-weight-regular"
            color="primary"
            outlined
            dark
            large
            @click="goToNameRequest()"
          >
            <span>Request a BC Business Name</span>
            <v-icon
              small
              class="ml-2"
            >
              mdi-open-in-new
            </v-icon>
          </v-btn>
        </div>
      </div>

      <v-row
        id="dashboard-actions"
        no-gutters
        class="mb-n3"
      >
        <v-col cols="auto">
          <!-- Add Existing Name Request or Business -->
          <v-menu
            v-model="addAffiliationDropdown"
          >
            <template #activator="{ on: onExistingMenu }">
              <v-tooltip
                top
                content-class="top-tooltip"
              >
                <template #activator="{ on: onExistingTooltip }">
                  <v-btn
                    id="add-existing-btn"
                    class="mt-2 mr-4"
                    color="primary"
                    dark
                    large
                    v-on="{ ...onExistingMenu, ...onExistingTooltip }"
                    @click="addAffiliationDropdown = !addAffiliationDropdown"
                  >
                    <v-icon>mdi-plus</v-icon>
                    <span><strong>Add an Existing Business or Name Request</strong></span>
                    <v-icon class="ml-2 mr-n2">
                      {{ addAffiliationDropdown ? 'mdi-menu-up' : 'mdi-menu-down' }}
                    </v-icon>
                  </v-btn>
                </template>
                <span>
                  To view and manage existing businesses and Name Requests,
                  you can manually add them to your table.
                </span>
              </v-tooltip>
            </template>
            <v-list>
              <v-list-item>
                <v-list-item-title class="d-inline-flex">
                  <v-icon>mdi-plus</v-icon>
                  <div class="ml-1 mt-1 add-existing-title">
                    Add an Existing...
                  </div>
                </v-list-item-title>
              </v-list-item>
              <v-list-item
                class="add-existing-item"
                @click="showAddBusinessModal()"
              >
                Business
              </v-list-item>
              <v-list-item
                class="add-existing-item"
                @click="showAddNRModal()"
              >
                Name Request
              </v-list-item>
            </v-list>
          </v-menu>

          <!-- Incorporate a Numbered BC Company or Business -->
          <v-menu v-model="incorporateNumberedDropdown">
            <template #activator="{ on: onNumberedMenu }">
              <v-tooltip
                top
                content-class="top-tooltip"
              >
                <template #activator="{ on: onNumberedTooltip }">
                  <v-btn
                    id="incorporate-numbered-btn"
                    class="mt-2 mr-4"
                    color="primary"
                    outlined
                    dark
                    large
                    v-on="{ ...onNumberedMenu, ...onNumberedTooltip }"
                    @click="incorporateNumberedDropdown = !incorporateNumberedDropdown"
                  >
                    <v-icon>mdi-plus</v-icon>
                    <span><strong>Incorporate a Numbered BC Company</strong></span>
                    <v-icon class="ml-2 mr-n2">
                      {{ incorporateNumberedDropdown ? 'mdi-menu-up' : 'mdi-menu-down' }}
                    </v-icon>
                  </v-btn>
                </template>
                <span>Start an incorporation application for a numbered company in B.C.</span>
              </v-tooltip>
            </template>
            <v-list>
              <v-list-item>
                <v-list-item-title class="d-inline-flex">
                  <v-icon>mdi-plus</v-icon>
                  <div class="ml-1 mt-1 add-existing-title">
                    Incorporate a...
                  </div>
                </v-list-item-title>
              </v-list-item>
              <v-tooltip
                right
                content-class="right-tooltip"
              >
                <template #activator="{ on, attrs }">
                  <v-list-item
                    v-bind="attrs"
                    id="incorporate-numbered-ben-btn"
                    class="add-existing-item"
                    v-on="on"
                    @click="startNumberedCompany(CorpTypes.BENEFIT_COMPANY)"
                  >
                    Numbered Benefit Company
                  </v-list-item>
                </template>
                <div>
                  A type of corporation with special commitments to conduct business in a responsible and
                  sustainable way.
                  <ul>
                    <li>Must publish and post an audited annual benefit report</li>
                    <li>Reported as Corporate tax</li>
                    <li>Has name protection in BC</li>
                  </ul>
                </div>
              </v-tooltip>
              <!-- Feature Flagged Buttons -->
              <div v-if="enableBcCccUlc">
                <v-tooltip
                  right
                  content-class="right-tooltip"
                >
                  <template #activator="{ on, attrs }">
                    <v-list-item
                      v-bind="attrs"
                      id="incorporate-numbered-limited-btn"
                      class="add-existing-item"
                      v-on="on"
                      @click="startNumberedCompany(CorpTypes.BC_COMPANY)"
                    >
                      Numbered Limited Company
                    </v-list-item>
                  </template>
                  <div>
                    A company that may have one or more people who own shares with some personal responsibility for debt
                    and liabilities.
                    <ul>
                      <li>Has many of the same rights of an individual</li>
                      <li>Reported separately as Corporate tax</li>
                      <li>Has name protection in BC</li>
                    </ul>
                  </div>
                </v-tooltip>
                <v-tooltip
                  right
                  content-class="right-tooltip"
                >
                  <template #activator="{ on, attrs }">
                    <v-list-item
                      v-bind="attrs"
                      id="incorporate-numbered-unlimited-btn"
                      class="add-existing-item"
                      v-on="on"
                      @click="startNumberedCompany(CorpTypes.BC_ULC_COMPANY)"
                    >
                      Numbered Unlimited Liability Company
                    </v-list-item>
                  </template>
                  <div>
                    A type of corporation that is often used by American corporations as a Canadian subsidiary or to hold
                    Canadian assets.
                    <ul>
                      <li>Shareholders liable for debts and liabilities</li>
                      <li>Reported separately as Canadian Corporate tax</li>
                      <li>Has name protection in BC</li>
                    </ul>
                  </div>
                </v-tooltip>
                <v-tooltip
                  right
                  content-class="right-tooltip"
                >
                  <template #activator="{ on, attrs }">
                    <v-list-item
                      v-bind="attrs"
                      id="incorporate-numbered-ccc-btn"
                      class="add-existing-item"
                      v-on="on"
                      @click="startNumberedCompany(CorpTypes.BC_CCC)"
                    >
                      Numbered Community Contribution Company
                    </v-list-item>
                  </template>
                  <div>
                    A type of corporation that has a benefit to the community. It is intended to bridge the gap between
                    for-profit and non-profit companies.
                    <ul>
                      <li>Reported as Corporate tax</li>
                      <li>Has name protection in BC</li>
                    </ul>
                  </div>
                </v-tooltip>
              </div>
            </v-list>
          </v-menu>
        </v-col>
        <v-col>
          <v-select
            v-model="selectedColumns"
            dense
            filled
            multiple
            class="column-selector"
            label="Columns to Show"
            :items="columns"
            :menu-props="{ bottom: true, offsetY: true }"
          >
            <template #selection />
          </v-select>
        </v-col>
      </v-row>

      <AffiliatedEntityTable
        :selectedColumns="selectedColumns"
        :loading="isLoading"
        :highlight-index="highlightIndex"
        @remove-business="showConfirmationOptionsModal($event)"
        @remove-affiliation-invitation="removeAffiliationInvitation()"
      />

      <PasscodeResetOptionsModal
        ref="passcodeResetOptionsModal"
        data-test="dialog-passcode-reset-options"
        @confirm-passcode-reset-options="remove($event)"
      />

      <!-- Add an Existing Business Dialog -->
      <AddBusinessDialog
        :dialog="addBusinessDialog"
        :isStaffOrSbcStaff="isStaffAccount || isSbcStaffAccount"
        :userFirstName="currentUser.firstName"
        :userLastName="currentUser.lastName"
        @add-success="showAddSuccessModal"
        @add-failed-invalid-code="showInvalidCodeModal($event)"
        @add-failed-no-entity="showEntityNotFoundModal()"
        @add-failed-passcode-claimed="showPasscodeClaimedModal()"
        @add-unknown-error="showUnknownErrorModal('business')"
        @on-cancel="cancelAddBusiness()"
        @on-business-identifier="businessIdentifier = $event"
        @business-already-added="showBusinessAlreadyAdded($event)"
      />

      <!-- Add Name Request Dialog -->
      <ModalDialog
        ref="addNRDialog"
        :is-persistent="true"
        :title="dialogTitle"
        :show-icon="false"
        :show-actions="false"
        max-width="640"
        data-test-tag="add-name-request"
      >
        <template #text>
          <p>
            Enter the Name Request Number (e.g., NR 1234567) and either the applicant phone number
            OR applicant email that were used when the name was requested.
          </p>
          <AddNameRequestForm
            class="mt-6"
            @close-add-nr-modal="cancelAddNameRequest()"
            @add-success="showAddSuccessModalNR()"
            @add-failed-show-msg="showNRErrorModal()"
            @add-failed-no-entity="showNRNotFoundModal()"
            @add-unknown-error="showUnknownErrorModal('nr')"
            @on-cancel="cancelAddNameRequest()"
          />
        </template>
      </ModalDialog>

      <!-- Success Dialog -->
      <ModalDialog
        ref="successDialog"
        :title="dialogTitle"
        :text="dialogText"
        dialog-class="notify-dialog"
        max-width="640"
      />

      <!-- NR/IA removal confirm Dialog/A generic one -->
      <ModalDialog
        ref="removalConfirmDialog"
        :title="dialogTitle"
        :text="dialogText"
        dialog-class="notify-dialog"
        max-width="640"
        data-test="remove-confirm-dialog"
      >
        <template #icon>
          <v-icon
            large
            color="error"
          >
            mdi-alert-circle-outline
          </v-icon>
        </template>
        <template #actions>
          <v-btn
            large
            color="primary"
            data-test="dialog-ok-button"
            @click="primaryBtnHandler()"
          >
            {{ primaryBtnText }}
          </v-btn>
          <v-btn
            large
            data-test="dialog-ok-button"
            @click="secondaryBtnHandler()"
          >
            {{ secondaryBtnText }}
          </v-btn>
        </template>
      </ModalDialog>

      <!-- Error Dialog -->
      <ModalDialog
        ref="errorDialog"
        :title="dialogTitle"
        :text="dialogText"
        dialog-class="notify-dialog"
        max-width="640"
      >
        <template #icon>
          <v-icon
            large
            color="error"
          >
            mdi-alert-circle-outline
          </v-icon>
        </template>
        <template #actions>
          <v-btn
            large
            color="primary"
            data-test="dialog-ok-button"
            @click="close()"
          >
            OK
          </v-btn>
        </template>
      </ModalDialog>

      <!-- Dialog for confirming business removal -->
      <ModalDialog
        ref="removedBusinessSuccessDialog"
        :title="dialogTitle"
        :text="dialogText"
        dialog-class="notify-dialog"
        max-width="640"
        :isPersistent="true"
      >
        <template #icon>
          <v-icon
            large
            color="primary"
          >
            mdi-check
          </v-icon>
        </template>
        <template #actions>
          <v-btn
            large
            color="primary"
            data-test="removed-business-success-button"
            @click="removedBusinessSuccessClose()"
          >
            OK
          </v-btn>
        </template>
      </ModalDialog>

      <v-snackbar
        id="success-nr-business-snackbar"
        v-model="showSnackbar"
        :timeout="timeoutMs"
        transition="fade"
      >
        {{ snackbarText }}
      </v-snackbar>
    </v-container>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { CorpTypes, FilingTypes, LDFlags, LoginSource, Pages } from '@/util/constants'
import { MembershipStatus, RemoveBusinessPayload } from '@/models/Organization'
import { mapActions, mapState } from 'pinia'
import AccountChangeMixin from '@/components/auth/mixins/AccountChangeMixin.vue'
import AccountMixin from '@/components/auth/mixins/AccountMixin.vue'
import AddBusinessDialog from '@/components/auth/manage-business/AddBusinessDialog.vue'
import AddNameRequestForm from '@/components/auth/manage-business/AddNameRequestForm.vue'
import { Address } from '@/models/address'
import AffiliatedEntityTable from '@/components/auth/manage-business/AffiliatedEntityTable.vue'
import ConfigHelper from '@/util/config-helper'
import LaunchDarklyService from 'sbc-common-components/src/services/launchdarkly.services'
import ModalDialog from '@/components/auth/common/ModalDialog.vue'
import NextPageMixin from '@/components/auth/mixins/NextPageMixin.vue'
import PasscodeResetOptionsModal from '@/components/auth/manage-business/PasscodeResetOptionsModal.vue'
import { appendAccountId } from 'sbc-common-components/src/util/common-util'
import { useBusinessStore } from '@/stores/business'
import { useOrgStore } from '@/stores/org'
import { useUserStore } from '@/stores/user'

@Component({
  components: {
    AddBusinessDialog,
    AddNameRequestForm,
    AffiliatedEntityTable,
    ModalDialog,
    PasscodeResetOptionsModal
  },
  computed: {
    ...mapState(useOrgStore, ['currentOrgAddress', 'currentAccountSettings']),
    ...mapState(useUserStore, ['userProfile', 'currentUser'])
  },
  methods: {
    ...mapActions(useBusinessStore, ['searchBusinessIndex', 'syncBusinesses', 'removeBusiness', 'createNumberedBusiness']),
    ...mapActions(useOrgStore, ['syncAddress'])
  }
})
export default class EntityManagement extends Mixins(AccountMixin, AccountChangeMixin, NextPageMixin) {
  @Prop({ default: '' }) readonly orgId: string

  // for template
  readonly CorpTypes = CorpTypes

  private removeBusinessPayload = null
  private dialogTitle = ''
  private dialogText = ''
  private isLoading = -1 // truthy
  businessIdentifier: string = null
  private primaryBtnText = ''
  private secondaryBtnText = ''
  private primaryBtnHandler: () => void = undefined
  private secondaryBtnHandler: () => void = undefined
  private lastSyncBusinesses = 0
  protected addBusinessDialog = false
  snackbarText: string = null
  showSnackbar = false
  timeoutMs = 4000
  highlightRowIndex = NaN // for newly added NR or Business

  /** V-model for dropdown menus. */
  private addAffiliationDropdown: boolean = false
  private incorporateNumberedDropdown: boolean = false

  readonly searchBusinessIndex!: (identifier: string) => Promise<number>
  private readonly syncBusinesses!: () => Promise<void>
  private readonly removeBusiness!: (removeBusinessPayload: RemoveBusinessPayload) => Promise<void>
  private readonly createNumberedBusiness!: ({ filingType, business }) => Promise<void>
  private readonly currentOrgAddress!: Address
  private readonly syncAddress!: () => Address
  private selectedColumns = ['Number', 'Type', 'Status']
  private columns = ['Number', 'Type', 'Status']
  highlightIndex = -1

  $refs: {
    successDialog: ModalDialog
    errorDialog: ModalDialog
    addNRDialog: ModalDialog
    passcodeResetOptionsModal: PasscodeResetOptionsModal,
    removedBusinessSuccessDialog: ModalDialog,
    removalConfirmDialog: ModalDialog
  }

  private async mounted () {
    if (this.currentMembership === undefined) {
      this.$router?.push(`/${Pages.CREATE_ACCOUNT}`)
      return
    }
    // If pending approval on current account, redirect away
    if (this.currentMembership?.membershipStatus !== MembershipStatus.Active) {
      this.$router?.push(this.getNextPageUrl())
      return
    }
    // check if address info is complete
    const isNotAnonUser = this.currentUser?.loginSource !== LoginSource.BCROS
    if (isNotAnonUser && this.enableMandatoryAddress) {
      // do it only if address is not already fetched.Or else try to fetch from DB
      if (!this.currentOrgAddress || Object.keys(this.currentOrgAddress).length === 0) {
        // sync and try again
        await this.syncAddress()
        if (!this.currentOrgAddress || Object.keys(this.currentOrgAddress).length === 0) {
          await this.$router?.push(`/${Pages.MAIN}/${this.orgId}/settings/account-info`)
          return
        }
      }
    }

    this.setAccountChangedHandler(this.setup)
    this.setup()
  }

  private async setup (): Promise<void> {
    // ensure syncBusinesses isn't already running
    if (this.isLoading === 1) {
      return
    }

    // ensure syncBusinesses hasn't just been run
    if (Date.now() - this.lastSyncBusinesses < 2000) {
      return
    }

    this.isLoading = 1 // truthy
    await this.syncBusinesses()
    this.lastSyncBusinesses = Date.now()
    this.isLoading = 0 // falsy
  }

  private get enableMandatoryAddress (): boolean {
    return LaunchDarklyService.getFlag(LDFlags.EnableMandatoryAddress) || false
  }

  get enableBcCccUlc (): boolean {
    return LaunchDarklyService.getFlag(LDFlags.EnableBcCccUlc) || false
  }

  get viewTitle (): string {
    return this.isStaffAccount ? 'My Staff Business Registry' : 'My Business Registry'
  }

  // open Name Request
  private goToNameRequest (): void {
    window.location.href = appendAccountId(ConfigHelper.getNameRequestUrl())
  }

  /** Creates a numbered IA filing (temp business). */
  protected async startNumberedCompany (corpType: CorpTypes): Promise<void> {
    const business = {
      nameRequest: {
        legalType: corpType
      }
    }
    await this.createNumberedBusiness({ filingType: FilingTypes.INCORPORATION_APPLICATION, business })
    await this.syncBusinesses()
  }

  async showAddSuccessModal (businessIdentifier: string) {
    this.addBusinessDialog = false
    this.dialogTitle = 'Business Added'
    this.dialogText = 'You have successfully added a business'
    await this.syncBusinesses()
    this.highlightIndex = await this.searchBusinessIndex(businessIdentifier)
    this.snackbarText = businessIdentifier + ' was successfully added to your table.'
    this.showSnackbar = true
    setTimeout(() => {
      this.highlightIndex = -1
    }, 4000)
  }

  async showAddSuccessModalNR () {
    this.$refs.addNRDialog.close()
    this.dialogTitle = 'Name Request Added'
    this.dialogText = 'You have successfully added a name request'
    await this.syncBusinesses()
    this.$refs.successDialog.open()
  }

  showInvalidCodeModal (label: string) {
    this.addBusinessDialog = false
    this.dialogTitle = `Invalid ${label}`
    this.dialogText = `Unable to add the business. The provided ${label} is invalid.`
    this.$refs.errorDialog.open()
  }

  showEntityNotFoundModal () {
    this.addBusinessDialog = false
    this.dialogTitle = 'Business Not Found'
    this.dialogText = 'The specified business was not found.'
    this.$refs.errorDialog.open()
  }

  showBusinessAlreadyAdded (event: { name, identifier }) {
    this.addBusinessDialog = false
    this.dialogTitle = 'Business Already Added'
    this.dialogText = `The business ${event.name} with the business number ${event.identifier} is already in your Business Registry List.`
    this.$refs.errorDialog.open()
  }

  showNRNotFoundModal () {
    this.$refs.addNRDialog.close()
    this.dialogTitle = 'Name Request Not Found'
    this.dialogText = 'The specified name request was not found.'
    this.$refs.errorDialog.open()
  }

  showNRErrorModal () {
    this.$refs.addNRDialog.close()
    this.dialogTitle = 'Error Adding Name Request'
    this.dialogText = ''
    this.$refs.errorDialog.open()
  }

  showPasscodeClaimedModal () {
    const contactNumber = this.$t('techSupportTollFree').toString()
    this.addBusinessDialog = false
    this.dialogTitle = 'Passcode Already Claimed'
    this.dialogText = `This passcode has already been claimed. If you have questions, please call ${contactNumber}`
    this.$refs.errorDialog.open()
  }

  showUnknownErrorModal (type: string) {
    if (type === 'business') {
      this.addBusinessDialog = false
      this.dialogTitle = 'Error Adding Existing Business'
      this.dialogText = 'An error occurred adding your business. Please try again.'
    } else if (type === 'nr') {
      this.$refs.addNRDialog.close()
      this.dialogTitle = 'Error Adding Existing Name Request'
      this.dialogText = 'An error occurred adding your name request. Please try again.'
    }
    this.$refs.errorDialog.open()
  }

  showAddBusinessModal () {
    this.addBusinessDialog = true
  }

  showAddNRModal () {
    this.dialogTitle = 'Add an Existing Name Request'
    this.$refs.addNRDialog.open()
  }

  async removeAffiliationInvitation () {
    await this.syncBusinesses()
  }

  showConfirmationOptionsModal (removeBusinessPayload: RemoveBusinessPayload) {
    this.removeBusinessPayload = removeBusinessPayload
    if (removeBusinessPayload.business.corpType.code === CorpTypes.NAME_REQUEST) {
      this.populateNRmodalValues()
      this.$refs.removalConfirmDialog.open()
    } else if (removeBusinessPayload.business.corpType.code === CorpTypes.INCORPORATION_APPLICATION) {
      this.populateIAmodalValues()
      this.$refs.removalConfirmDialog.open()
    } else if (removeBusinessPayload.business.corpType.code === CorpTypes.REGISTRATION) {
      this.populateRegistrationModalValues()
      this.$refs.removalConfirmDialog.open()
    } else if (
      removeBusinessPayload.business.corpType.code === CorpTypes.PARTNERSHIP ||
      removeBusinessPayload.business.corpType.code === CorpTypes.SOLE_PROP
    ) {
      this.populateFirmModalValues()
      this.$refs.removalConfirmDialog.open()
    } else {
      this.$refs.passcodeResetOptionsModal.open()
    }
  }

  private populateNRmodalValues () {
    this.dialogTitle = this.$t('removeNRConfirmTitle').toString()
    this.dialogText = this.$t('removeNRConfirmText').toString()
    this.primaryBtnText = 'Remove Name Request'
    this.secondaryBtnText = 'Keep Name Request'
    this.primaryBtnHandler = this.confirmRemovalNr
    this.secondaryBtnHandler = this.cancelRemoval
  }

  private populateIAmodalValues () {
    this.dialogTitle = this.$t('removeIAConfirmTitle').toString()
    this.dialogText = this.$t('removeIAConfirmText').toString()
    this.primaryBtnText = 'Delete Incorporation Application'
    this.secondaryBtnText = 'Keep Incorporation Application'
    this.primaryBtnHandler = this.confirmRemovalIA
    this.secondaryBtnHandler = this.cancelRemoval
  }

  private populateRegistrationModalValues () {
    this.dialogTitle = this.$t('removeRegistrationConfirmTitle').toString()
    this.dialogText = this.$t('removeRegistrationConfirmText').toString()
    this.primaryBtnText = 'Delete Registration'
    this.secondaryBtnText = 'Keep Registration'
    this.primaryBtnHandler = this.confirmRemovalRegistration
    this.secondaryBtnHandler = this.cancelRemoval
  }
  private populateFirmModalValues () {
    this.dialogTitle = this.$t('removeFirmConfirmTitle').toString()
    this.dialogText = this.$t('removeFirmConfirmText').toString()
    this.primaryBtnText = 'Remove Registration'
    this.secondaryBtnText = 'Keep Registration'
    this.primaryBtnHandler = this.confirmRemovalFirm
    this.secondaryBtnHandler = this.cancelRemoval
  }

  cancelRemoval () {
    this.$refs.removalConfirmDialog.close()
  }

  confirmRemovalRegistration () {
    this.$refs.removalConfirmDialog.close()
    this.remove('', false, 'removeRegistrationSuccessTitle', 'removeRegistrationSuccessText')
  }

  confirmRemovalIA () {
    this.$refs.removalConfirmDialog.close()
    this.remove('', false, 'removeIASuccessTitle', 'removeIASuccessText')
  }

  confirmRemovalNr () {
    this.$refs.removalConfirmDialog.close()
    this.remove('', false, 'removeNRSuccessTitle', 'removeNRSuccessText')
  }

  confirmRemovalFirm () {
    this.$refs.removalConfirmDialog.close()
    this.remove('', false, 'removeFirmSuccessTitle', 'removeFirmSuccessText')
  }

  cancelAddBusiness () {
    this.addBusinessDialog = false
  }

  cancelAddNameRequest () {
    this.$refs.addNRDialog.close()
  }

  async remove (resetPasscodeEmail: string, resetPasscode = true, dialogTitleKey = 'removeBusiness', dialogTextKey = 'removedBusinessSuccessText') {
    try {
      this.removeBusinessPayload.passcodeResetEmail = resetPasscodeEmail
      this.removeBusinessPayload.resetPasscode = resetPasscode
      this.$refs.passcodeResetOptionsModal.close()
      await this.removeBusiness(this.removeBusinessPayload)
      this.dialogText = this.$t(dialogTextKey).toString()
      this.dialogTitle = this.$t(dialogTitleKey).toString()
      await this.syncBusinesses()
      this.$refs.removedBusinessSuccessDialog.open()
    } catch (ex) {
      // eslint-disable-next-line no-console
      console.log('Error during remove organization affiliations event !')
    }
  }

  removedBusinessSuccessClose () {
    this.$refs.removedBusinessSuccessDialog.close()
  }

  close () {
    this.$refs.errorDialog.close()
  }
}
</script>

<style lang="scss" scoped>
@import '$assets/scss/theme.scss';

.loading-container.grayed-out {
  // these are the same styles as dialog overlay:
  opacity: 0.46;
  background-color: rgb(33, 33, 33); // grey darken-4
  border-color: rgb(33, 33, 33); // grey darken-4
}

.v-tooltip__content {
  background-color: RGBA(73, 80, 87, 0.95) !important;
  color: white !important;
  border-radius: 4px;
  font-size: 12px !important;
  line-height: 18px !important;
  padding: 15px !important;
  letter-spacing: 0;
  max-width: 360px !important;
}

.v-tooltip__content:after {
  content: "" !important;
  position: absolute !important;
  top: 50% !important;
  right: 100% !important;
  margin-top: -10px !important;
  border-top: 10px solid transparent !important;
  border-bottom: 10px solid transparent !important;
  border-right: 8px solid RGBA(73, 80, 87, .95) !important;
}

.top-tooltip:after {
  top: 100% !important;
  left: 45% !important;
  margin-top: 0 !important;
  border-right: 10px solid transparent !important;
  border-left: 10px solid transparent !important;
  border-top: 8px solid RGBA(73, 80, 87, 0.95) !important;
}

.right-tooltip:after {
  top: 50% !important;
  right: 100% !important;
  margin-top: -10px !important;
  border-bottom: 10px solid transparent !important;
  border-left: 10px solid transparent !important;
  border-top: 10px solid transparent !important;
  border-right: 8px solid RGBA(73, 80, 87, 0.95) !important;
}

.view-header {
  justify-content: space-between;

  h1 {
    margin-bottom: -10px;
  }

  .subtitle {
    font-size: 1rem;
    color: $gray7;
    font-weight: normal;
  }

  .v-btn {
    font-weight: 700;
  }
}

#add-existing-btn {
  box-shadow: none;
  background-color: $app-blue !important;
}

.add-existing-title {
  font-size: .875rem;
}

.add-existing-item {
  height: 40px !important;
  font-size: .875rem;
  color: $gray7;

  &:hover {
    background-color: $app-background-blue;
  }
}

.column-selector {
  float: right;
  width: 200px;
}

// Vuetify Overrides
::v-deep {
  #dashboard-actions {
    .v-input .v-label {
      transform: translateY(-10px) scale(1);
      top: 30px;
      color: $gray7;
      font-size: .875rem;
    }
  }

  .v-data-table td {
    padding-top: 1rem;
    padding-bottom: 1rem;
    height: auto;
    vertical-align: top;
  }

  .v-list-item__title {
    display: block;
    font-weight: 700;
  }

  .theme--light.v-list-item:not(.v-list-item--active):not(.v-list-item--disabled):hover {
    color: $app-blue !important;
  }

  .v-list .v-list-item--active, .v-list .v-list-item--active {
    &:hover {
      background-color: $app-background-blue;
    }
  }

  .v-list-item {
    min-height: 0 !important;
    height: 32px;
  }

  .theme--light.v-list-item--active:before, .theme--light.v-list-item--active:hover:before,
  .theme--light.v-list-item:focus:before {
    opacity: 0 !important;
  }

  .v-list-item__action {
    margin-right: 20px !important;
  }

  .v-list-item .v-list-item__subtitle, .v-list-item .v-list-item__title {
    color: $gray7;
    &:hover {
      color: $app-blue !important;
    }
  }
}
</style>
