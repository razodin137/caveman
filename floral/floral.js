const form = document.querySelector(".contact__form")
const success = document.querySelector("[data-success]")
const submit = form.querySelector("button")

const checks = {
  name(value) {
    if (value.trim().length < 2) {
      return "The name field came back empty — type at least a first name so we know who to reply to."
    }
    return ""
  },
  email(value) {
    const email = value.trim()
    if (email.length === 0) {
      return "The email field came back empty — our reply goes there."
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "That email address looks incomplete — check for a missing \u201c@\u201d or domain."
    }
    return ""
  }
}

const fields = [...form.querySelectorAll("input[name]")].filter((input) => checks[input.name])

const fieldOf = (input) => input.closest(".field")
const helperOf = (input) => fieldOf(input).querySelector(".field__helper")

function validate(input) {
  const message = checks[input.name](input.value)
  const field = fieldOf(input)
  const helper = helperOf(input)
  input.dataset.helper = input.dataset.helper || helper.textContent
  if (message) {
    field.classList.add("field--error")
    helper.textContent = message
    input.setAttribute("aria-invalid", "true")
    return false
  }
  field.classList.remove("field--error")
  helper.textContent = input.dataset.helper
  input.setAttribute("aria-invalid", "false")
  return true
}

fields.forEach((input) => {
  input.addEventListener("blur", () => {
    input.dataset.touched = "true"
    validate(input)
  })
  input.addEventListener("input", () => {
    if (input.dataset.touched) validate(input)
  })
})

form.addEventListener("submit", (event) => {
  event.preventDefault()
  const results = fields.map(validate)
  if (results.includes(false)) {
    const first = fields.find((input) => fieldOf(input).classList.contains("field--error"))
    first.scrollIntoView({ block: "center" })
    first.focus({ preventScroll: true })
    return
  }
  submit.disabled = true
  submit.textContent = "Sending\u2026"
  window.setTimeout(() => {
    form.hidden = true
    success.hidden = false
    success.focus()
  }, 800)
})

const revealTargets = document.querySelectorAll(".card, .tile, .about__text, .contact__info, .contact__form, .section__head")

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible")
      revealObserver.unobserve(entry.target)
    }
  })
}, { threshold: 0.15 })

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

if (!reducedMotion) {
  revealTargets.forEach((target, index) => {
    target.classList.add("reveal")
    target.style.transitionDelay = `${(index % 3) * 80}ms`
    revealObserver.observe(target)
  })
}