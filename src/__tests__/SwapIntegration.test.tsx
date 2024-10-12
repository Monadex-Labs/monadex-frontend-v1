
import React, { lazy } from 'react'
import { expect, jest, describe, test, beforeEach, it } from '@jest/globals'
import { render, screen, fireEvent, waitFor, waitForElementToBeRemoved, act } from '@testing-library/react'

describe(() => {
  beforeEach(() => {
    cy.visit('/')
  })
})
