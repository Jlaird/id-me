import Controller from '@ember/controller';
import { ObjectQueryManager } from 'ember-apollo-client';
import ActionMixin from '@base-cms/id-me-manage/mixins/action-mixin';
import gql from 'graphql-tag';

const mutation = gql`
  mutation Signup($input: RegisterNewUserMutationInput!) {
    registerNewUser(input: $input){
      user {
        id
        email
      }
      organization {
        id
        name
        description
      }
    }
  }
`;

export default Controller.extend(ActionMixin, ObjectQueryManager, {
  email: null,
  givenName: null,
  familyName: null,
  orgName: null,
  sent: false,

  actions: {
    async submit() {
      this.startAction();
      const { email, orgName } = this.getProperties('email', 'orgName');
      const { givenName, familyName } = this.getProperties('givenName', 'familyName');
      const input = {
        email,
        orgName,
        givenName,
        familyName,
      };
      const variables = { input };
      try {
        await this.get('apollo').mutate({ mutation, variables }, 'registerNewUser');
        this.set('sent', true);
      } catch (e) {
        this.get('graphErrors').show(e);
      } finally {
        this.endAction();
      }
    },
  }
});