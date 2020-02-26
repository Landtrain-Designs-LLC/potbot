/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getDevice = /* GraphQL */ `
  query GetDevice($customerEmail: String!) {
    getDevice(customerEmail: $customerEmail) {
      id
      customerEmail
      publicKey
    }
  }
`;
export const listDevices = /* GraphQL */ `
  query ListDevices(
    $customerEmail: String
    $filter: ModelDeviceFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listDevices(
      customerEmail: $customerEmail
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        id
        customerEmail
        publicKey
      }
      nextToken
    }
  }
`;
