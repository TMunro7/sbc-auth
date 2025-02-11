<template>
  <v-form
    ref="createAccountInfoForm"
    class="mt-8"
    data-test="form-stepper-basic-wrapper"
  >
    <account-business-type
      :govmAccount="govmAccount"
      :errorMessage="errorMessage"
      :saving="saving"
      @update:org-business-type="updateOrgBusinessType"
      @valid="checkOrgBusinessTypeValid"
    />

    <fieldset
      v-if="isExtraProvUser || enablePaymentMethodSelectorStep "
      v-display-mode
    >
      <legend class="mb-3">
        Mailing Address
      </legend>
      <base-address-form
        ref="mailingAddress"
        :editing="true"
        :schema="baseAddressSchema"
        :address="address"
        @update:address="updateAddress"
        @valid="checkBaseAddressValidity"
      />
    </fieldset>

    <v-divider class="mt-4 mb-10" />

    <v-row>
      <v-col
        cols="12"
        class="form__btns py-0 d-inline-flex"
      >
        <v-btn
          large
          depressed
          color="default"
          data-test="btn-back"
          @click="goBack"
        >
          <v-icon
            left
            class="mr-2 ml-n2"
          >
            mdi-arrow-left
          </v-icon>
          <span>Back</span>
        </v-btn>
        <v-spacer />
        <v-btn
          large
          color="primary"
          class="mr-3 save-btn"
          :loading="saving"
          :disabled="!isFormValid() || saving"
          data-test="save-button"
          @click="save"
        >
          <span>Next
            <v-icon class="ml-2">mdi-arrow-right</v-icon>
          </span>
        </v-btn>
        <ConfirmCancelButton
          :disabled="saving"
          :target-route="cancelUrl"
          :showConfirmPopup="false"
        />
      </v-col>
    </v-row>
  </v-form>
</template>

<script lang="ts">
import { Account, LDFlags, LoginSource } from '@/util/constants'
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { CreateRequestBody, Member, OrgBusinessType, Organization } from '@/models/Organization'
import { mapActions, mapState } from 'pinia'
import AccountBusinessType from '@/components/auth/common/AccountBusinessType.vue'
import { Address } from '@/models/address'
import BaseAddressForm from '@/components/auth/common/BaseAddressForm.vue'
import ConfirmCancelButton from '@/components/auth/common/ConfirmCancelButton.vue'
import LaunchDarklyService from 'sbc-common-components/src/services/launchdarkly.services'
import Steppable from '@/components/auth/common/stepper/Steppable.vue'
import { addressSchema } from '@/schemas'
import { useOrgStore } from '@/stores/org'
import { useUserStore } from '@/stores/user'

@Component({
  components: {
    AccountBusinessType,
    BaseAddressForm,
    ConfirmCancelButton
  },
  computed: {
    ...mapState(useOrgStore, [
      'currentOrganization',
      'currentOrgAddress',
      'currentOrganizationType'
    ]),
    ...mapState(useUserStore, ['userProfile', 'currentUser'])
  },
  methods: {
    ...mapActions(useOrgStore, ['syncMembership', 'syncOrganization', 'isOrgNameAvailable', 'setCurrentOrganization',
      'setCurrentOrganizationAddress'])
  }
})
export default class AccountCreateBasic extends Mixins(Steppable) {
  private errorMessage: string = ''
  private saving = false
  private isBasicAccount: boolean = true
  private readonly syncMembership!: (orgId: number) => Promise<Member>
  private readonly syncOrganization!: (orgId: number) => Promise<Organization>
  private readonly isOrgNameAvailable!: (requestBody: CreateRequestBody) => Promise<boolean>
  private readonly setCurrentOrganization!: (organization: Organization) => void
  private readonly currentOrganization!: Organization

  @Prop() cancelUrl: string
  @Prop({ default: false }) govmAccount: boolean
  @Prop({ default: false }) readOnly: boolean
  private isBaseAddressValid = !this.isExtraProvUser && !this.enablePaymentMethodSelectorStep
  private readonly currentOrgAddress!: Address
  private readonly currentOrganizationType!: string
  private readonly setCurrentOrganizationAddress!: (address: Address) => void
  private orgBusinessTypeLocal: OrgBusinessType = {}

  private baseAddressSchema = addressSchema
  private isOrgBusinessTypeValid = false
  // Org Id variable to store the current organization ID of the invitation IDIR account
  private orgId: number = null

  $refs: {
    createAccountInfoForm: HTMLFormElement
  }

  private isFormValid (): boolean {
    return !!this.isOrgBusinessTypeValid && !!this.isBaseAddressValid
  }

  private async mounted () {
    if (this.govmAccount) {
      this.orgId = this.currentOrganization.id
    }
    if (this.enablePaymentMethodSelectorStep) {
      this.isBasicAccount = (this.currentOrganizationType === Account.BASIC)
    }
  }

  private get enablePaymentMethodSelectorStep (): boolean {
    return LaunchDarklyService.getFlag(LDFlags.PaymentTypeAccountCreation) || false
  }

  private get address () {
    return this.currentOrgAddress
  }
  private updateAddress (address: Address) {
    this.setCurrentOrganizationAddress(address)
  }

  private updateOrgBusinessType (orgBusinessType: OrgBusinessType) {
    this.orgBusinessTypeLocal = orgBusinessType
  }

  private checkOrgBusinessTypeValid (isValid) {
    this.isOrgBusinessTypeValid = !!isValid
  }

  private checkBaseAddressValidity (isValid) {
    this.isBaseAddressValid = !!isValid
  }

  private get isExtraProvUser () {
    // Remove Vuex with Vue 3
    return this.$store.getters['auth/currentLoginSource'] === LoginSource.BCEID
  }

  public async save () {
    // Validate form, and then create an team with this user a member
    if (this.isFormValid()) {
      // if its not account change , do check for duplicate
      // if its account change , check if user changed the already existing name

      // changed this for accomadating bceid account re-upload
      const checkNameAVailability = (this.orgBusinessTypeLocal.name !== this.currentOrganization?.name)
      // no need to check name if govmAccount
      if (checkNameAVailability && !this.govmAccount) {
        const available = await this.isOrgNameAvailable({
          'name': this.orgBusinessTypeLocal.name,
          'branchName': this.orgBusinessTypeLocal.branchName
        })
        if (!available) {
          this.errorMessage =
                'An account with this name already exists. Try a different account name.'
          return
        }
      }
      const orgType = (this.isBasicAccount) ? Account.BASIC : Account.PREMIUM

      let org: Organization = { name: this.orgBusinessTypeLocal.name, orgType: orgType }
      if (this.govmAccount) {
        org = { ...org, ...{ branchName: this.orgBusinessTypeLocal.branchName, id: this.orgId } }
      }
      if (this.orgBusinessTypeLocal.isBusinessAccount) {
        org = { ...org,
          ...{ branchName: this.orgBusinessTypeLocal.branchName,
            isBusinessAccount: this.orgBusinessTypeLocal.isBusinessAccount,
            businessSize: this.orgBusinessTypeLocal.businessSize,
            businessType: this.orgBusinessTypeLocal.businessType } }
      }
      // removed this to avoid over writing current or details, which need to show in all page.
      if (!this.readOnly) {
        this.setCurrentOrganization(org)
      }
      // check if the name is avaialble
      this.stepForward()
    }
  }

  private redirectToNext (organization?: Organization) {
    this.$router.push({ path: `/account/${organization.id}/` })
  }

  private goBack () {
    this.stepBack()
  }

  private goNext () {
    this.stepForward()
  }
}
</script>

<style lang="scss" scoped>
@import '$assets/scss/theme.scss';

// Tighten up some of the spacing between rows
[class^='col'] {
  padding-top: 0;
  padding-bottom: 0;
}

.form__btns {
  display: flex;
  justify-content: flex-end;
}

.bcol-acc-label {
  font-size: 1.35rem;
  font-weight: 600;
}

.grant-access {
  font-size: 1rem !important;
}
</style>
