import { Wrapper, shallowMount } from '@vue/test-utils'
import AddBusinessDialog from '@/components/auth/manage-business/AddBusinessDialog.vue'
import HelpDialog from '@/components/auth/common/HelpDialog.vue'
import Vuetify from 'vuetify'
import flushPromises from 'flush-promises'
import { useOrgStore } from '@/stores/org'

const vuetify = new Vuetify({})

const tests = [
  {
    desc: 'renders the component properly for a CP',
    businessIdentifier: 'CP0000000',
    passcodeLabel: 'Passcode',
    certifyExists: false,
    passcodeExists: true,
    folioNumberExists: true,
    forgotButtonText: 'I lost or forgot my passcode',
    isStaffOrSbcStaff: false,
    userFirstName: 'Nadia',
    userLastName: 'Woodie'
  },
  {
    desc: 'renders the component properly for a BC',
    businessIdentifier: 'BC0000000',
    passcodeLabel: 'Password',
    certifyExists: false,
    passcodeExists: true,
    folioNumberExists: true,
    forgotButtonText: 'I lost or forgot my password',
    isStaffOrSbcStaff: false,
    userFirstName: 'Nadia',
    userLastName: 'Woodie'
  },
  {
    desc: 'renders the component properly for a FM (client User)',
    businessIdentifier: 'FM0000000',
    passcodeLabel: 'Proprietor or Partner Name (e.g., Last Name, First Name Middlename)',
    certifyExists: true,
    passcodeExists: true,
    folioNumberExists: true,
    forgotButtonText: null,
    isStaffOrSbcStaff: false,
    userFirstName: 'Nadia',
    userLastName: 'Woodie'
  },
  {
    desc: 'renders the component properly for a FM (staff user)',
    businessIdentifier: 'FM0000000',
    certifyExists: false,
    passcodeExists: false,
    folioNumberExists: false,
    forgotButtonText: null,
    isStaffOrSbcStaff: true,
    userFirstName: 'Nadia',
    userLastName: 'Woodie'
  },
  {
    desc: 'renders the component properly for a FM (sbc staff)',
    businessIdentifier: 'FM0000000',
    certifyExists: false,
    passcodeExists: false,
    folioNumberExists: false,
    forgotButtonText: null,
    isStaffOrSbcStaff: true,
    userFirstName: 'Nadia',
    userLastName: 'Woodie'
  }
]
tests.forEach(test => {
  describe('Add Business Form', () => {
    let wrapper: Wrapper<any>

    beforeAll(() => {
      const orgStore = useOrgStore()
      orgStore.currentOrganization = {
        name: 'new org'
      }

      wrapper = shallowMount(AddBusinessDialog, {
        vuetify,
        propsData: {
          dialog: true,
          isStaffOrSbcStaff: test.isStaffOrSbcStaff,
          userFirstName: test.userFirstName,
          userLastName: test.userLastName
        }
      }
      )
    })

    afterAll(() => {
      wrapper.destroy()
    })

    it(test.desc, async () => {
      wrapper.setData({
        businessIdentifier: test.businessIdentifier,
        businessName: 'My Business Inc'
      })
      await flushPromises()

      // verify components
      expect(wrapper.attributes('id')).toBe('add-business-dialog')
      expect(wrapper.find('#add-business-dialog').isVisible()).toBe(true)
      // expect(wrapper.find('businesslookup-stub').exists()).toBe(true) // UN-COMMENT (see below)
      expect(wrapper.findComponent(HelpDialog).exists()).toBe(true)

      // *** UN-COMMENT THIS WHEN BUSINESS LOOKUP IS ENABLED ***
      // // verify data list
      // const dl = wrapper.find('dl')
      // const dt = dl.findAll('dt')
      // const dd = dl.findAll('dd')
      // expect(dt.at(0).text()).toBe('Business Name:')
      // expect(dd.at(0).text()).toBe('My Business Inc')
      // expect(dt.at(1).text()).toBe('Incorporation Number:')
      // expect(dd.at(1).text()).toBe(test.businessIdentifier)

      // verify input fields
      expect(wrapper.find('.business-identifier').attributes('label'))
        .toBe('Incorporation Number or Registration Number') // DELETE THIS (see above)
      expect(wrapper.find('.passcode').exists()).toBe(test.passcodeExists)
      if (test.passcodeExists) {
        expect(wrapper.find('.passcode').attributes('label')).toBe(test.passcodeLabel)
      }
      expect(wrapper.find('.certify').exists()).toBe(test.certifyExists)
      if (test.folioNumberExists) {
        expect(wrapper.find('.folio-number').attributes('label')).toBe('Folio or Reference Number (Optional)')
      }
      if (!test.isStaffOrSbcStaff) {
        expect(wrapper.find('.authorization').exists())
      }

      // verify buttons
      if (!test.certifyExists) {
        expect(wrapper.find('#forgot-button').exists()).toBe(!!test.forgotButtonText)
      }
      if (test.forgotButtonText) {
        expect(wrapper.find('#forgot-button span').text()).toBe(test.forgotButtonText)
      }
      expect(wrapper.find('#cancel-button span').text()).toBe('Cancel')

      // always enable add button
      expect(wrapper.find('#add-button span').text()).toBe('Add')
    })
  })
})
