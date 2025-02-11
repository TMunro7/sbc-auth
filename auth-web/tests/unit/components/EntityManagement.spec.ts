import '../test-utils/composition-api-setup' // important to import this first
import { createLocalVue, mount } from '@vue/test-utils'
import { useOrgStore, useUserStore } from '@/stores'
import { CorpTypes } from '@/util/constants'
import EntityManagement from '@/components/auth/manage-business/EntityManagement.vue'
import { RemoveBusinessPayload } from '@/models/Organization'
import Vue from 'vue'
import Vuetify from 'vuetify'
import { setupIntersectionObserverMock } from '../util/helper-functions'

const vuetify = new Vuetify({})

// Prevent the warning "[Vuetify] Unable to locate target [data-app]"
document.body.setAttribute('data-app', 'true')

function getPayLoad (type: any) {
  const removeNRPayload: RemoveBusinessPayload = {
    business: {
      corpType: {
        code: type as CorpTypes,
        desc: type as string
      },
      businessIdentifier: 'test',
      folioNumber: 'test'
    },
    orgIdentifier: 10
  }
  return removeNRPayload
}

describe('Entity Management Component', () => {
  setupIntersectionObserverMock()
  let wrapper: any
  let mockedNrMethod: any

  beforeEach(() => {
    const localVue = createLocalVue()
    const $t = () => 'test'

    const orgStore = useOrgStore()
    orgStore.currentOrganization = {
      name: 'new org',
      orgType: 'STAFF'
    } as any

    const userStore = useUserStore()
    userStore.currentUser = {
      firstName: 'Nadia',
      lastName: 'Woodie'
    } as any

    wrapper = mount(EntityManagement, {
      vuetify,
      localVue,
      mocks: { $t },
      computed: {
        enableBcCccUlc () {
          return true
        }
      }
    })
    mockedNrMethod = vi.fn()
    wrapper.vm.$refs.removalConfirmDialog.open = mockedNrMethod
  })

  afterEach(() => {
    wrapper.destroy()
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('EntityManagement is a Vue instance', () => {
    expect(wrapper.vm).toBeTruthy()
  })

  it('EntityManagement contains removalConfirmDialog modal', () => {
    const modal = wrapper.find({ ref: 'removalConfirmDialog' })
    expect(modal.exists()).toBe(true)
  })

  it('calls the nr open modal with correct buttons', async () => {
    const removeNRPayload = getPayLoad('NR')
    wrapper.vm.showConfirmationOptionsModal(removeNRPayload)
    expect(mockedNrMethod).toHaveBeenCalled()
    expect(wrapper.vm.primaryBtnText).toBe('Remove Name Request')
    expect(wrapper.vm.secondaryBtnText).toBe('Keep Name Request')
  })
  it('calls the IA open modal with correct buttons', async () => {
    const removeBusinessPayload: RemoveBusinessPayload = getPayLoad('TMP')
    wrapper.vm.showConfirmationOptionsModal(removeBusinessPayload)
    expect(mockedNrMethod).toHaveBeenCalled()
    expect(wrapper.vm.primaryBtnText).toBe('Delete Incorporation Application')
    expect(wrapper.vm.secondaryBtnText).toBe('Keep Incorporation Application')
  })
  it('calls the Passcode reset open modal with correct buttons', async () => {
    const removeBusinessPayload: RemoveBusinessPayload = getPayLoad('CP')
    const mockedPasscodeResetMethod = vi.fn()
    wrapper.vm.$refs.passcodeResetOptionsModal.open = mockedPasscodeResetMethod
    wrapper.vm.showConfirmationOptionsModal(removeBusinessPayload)
    expect(mockedNrMethod).toHaveBeenCalledTimes(0)
    expect(mockedPasscodeResetMethod).toHaveBeenCalled()
  })
  it('calls the IA open modal with correct buttons', async () => {
    const removeBusinessPayload: RemoveBusinessPayload = getPayLoad('SP')
    wrapper.vm.showConfirmationOptionsModal(removeBusinessPayload)
    expect(mockedNrMethod).toHaveBeenCalled()
    expect(wrapper.vm.primaryBtnText).toBe('Remove Registration')
    expect(wrapper.vm.secondaryBtnText).toBe('Keep Registration')
  })
  it('calls the IA open modal with correct buttons', async () => {
    const removeBusinessPayload: RemoveBusinessPayload = getPayLoad('GP')
    wrapper.vm.showConfirmationOptionsModal(removeBusinessPayload)
    expect(mockedNrMethod).toHaveBeenCalled()
    expect(wrapper.vm.primaryBtnText).toBe('Remove Registration')
    expect(wrapper.vm.secondaryBtnText).toBe('Keep Registration')
  })
  it('all buttons, tooltips and v-menu selections exist', async () => {
    // All buttons exist
    expect(wrapper.find('#add-existing-btn').exists()).toBe(true)
    expect(wrapper.find('#add-name-request-btn').exists()).toBe(true)
    expect(wrapper.find('#incorporate-numbered-btn').exists()).toBe(true)

    // Existing Business or NameRequest menu selections
    wrapper.find('#add-existing-btn').trigger('click')
    await Vue.nextTick()
    expect(wrapper.findAll('.add-existing-item').length).toBe(2)

    // tooltips exist
    expect(wrapper.findAll('.top-tooltip').length).toBe(2)
  })

  it('all incorporate numbered businesses btns exist', async () => {
    // Enter the Incorporate a Numbered BC Company drop down.
    const incorporateNumberedBtn = wrapper.find('#incorporate-numbered-btn')
    incorporateNumberedBtn.trigger('click')
    await Vue.nextTick()

    expect(wrapper.find('#incorporate-numbered-ben-btn').exists()).toBe(true)
    expect(wrapper.find('#incorporate-numbered-limited-btn').exists()).toBe(true)
    expect(wrapper.find('#incorporate-numbered-unlimited-btn').exists()).toBe(true)
    expect(wrapper.find('#incorporate-numbered-ccc-btn').exists()).toBe(true)
  })
})
