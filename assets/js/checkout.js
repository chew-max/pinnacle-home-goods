window.JekyllCommerceCheckout = {
  endpoint:
    window.JekyllCommerceConfig
      ?.checkoutEndpoint || "",


  getFieldValue:
    function (id) {
      const element =
        document.getElementById(
          id
        );

      if (!element) {
        return "";
      }

      return element.value
        .trim();
    },


  showError:
    function (message) {
      const errorElement =
        document.getElementById(
          "checkout-error"
        );

      if (!errorElement) {
        alert(message);
        return;
      }

      errorElement.textContent =
        message;

      errorElement.hidden =
        false;

      /*
       * Bring the error into view,
       * especially on mobile.
       */
      try {
        errorElement.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      } catch (error) {
        /*
         * Older browsers may not
         * support scrollIntoView options.
         */
      }
    },


  clearError:
    function () {
      const errorElement =
        document.getElementById(
          "checkout-error"
        );

      if (!errorElement) {
        return;
      }

      errorElement.textContent =
        "";

      errorElement.hidden =
        true;
    },


  validateCustomer:
    function () {
      this.clearError();


      const name =
        this.getFieldValue(
          "checkout-name"
        );

      const email =
        this.getFieldValue(
          "checkout-email"
        );

      const phone =
        this.getFieldValue(
          "checkout-phone"
        );

      const address1 =
        this.getFieldValue(
          "checkout-address1"
        );

      const address2 =
        this.getFieldValue(
          "checkout-address2"
        );

      const city =
        this.getFieldValue(
          "checkout-city"
        );

      const state =
        this.getFieldValue(
          "checkout-state"
        );

      const postalCode =
        this.getFieldValue(
          "checkout-postal-code"
        );

      const country =
        this.getFieldValue(
          "checkout-country"
        );


      const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      const zipPattern =
        /^\d{5}(-\d{4})?$/;


      if (!name) {
        this.showError(
          "Please enter your full name."
        );

        return null;
      }


      if (
        !emailPattern.test(
          email
        )
      ) {
        this.showError(
          "Please enter a valid email address."
        );

        return null;
      }


      if (!address1) {
        this.showError(
          "Please enter your shipping address."
        );

        return null;
      }


      if (!city) {
        this.showError(
          "Please enter your city."
        );

        return null;
      }


      if (!state) {
        this.showError(
          "Please select your state."
        );

        return null;
      }


      if (
        !zipPattern.test(
          postalCode
        )
      ) {
        this.showError(
          "Please enter a valid ZIP code."
        );

        return null;
      }


      if (
        country !== "US"
      ) {
        this.showError(
          "Only United States shipping is currently supported."
        );

        return null;
      }


      return {
        email:
          email,

        customer: {
          name:
            name,

          phone:
            phone,

          shipping: {
            address1:
              address1,

            address2:
              address2,

            city:
              city,

            state:
              state,

            postalCode:
              postalCode,

            country:
              country
          }
        }
      };
    },


getCheckoutErrorMessage(response, data) {
  const status =
    Number(response?.status) || 0;

  const errorCode =
    String(data?.error || "")
      .trim()
      .toUpperCase();

  const serverMessage =
    String(data?.message || "")
      .trim();


  /*
   * -------------------------------------------------------
   * Temporary checkout / service failures
   * -------------------------------------------------------
   *
   * IMPORTANT:
   * Handle CHECKOUT_UNAVAILABLE before looking for the
   * generic word "unavailable".
   *
   * Otherwise CHECKOUT_UNAVAILABLE gets incorrectly treated
   * as VARIANT_UNAVAILABLE.
   */

  if (
    errorCode === "CHECKOUT_UNAVAILABLE" ||
    status >= 500
  ) {
    return (
      "Checkout is temporarily unavailable. " +
      "Your cart has been preserved. Please try again."
    );
  }


  /*
   * -------------------------------------------------------
   * Rate limiting
   * -------------------------------------------------------
   */

  if (status === 429) {
    return (
      "Checkout is temporarily busy. " +
      "Please wait a moment and try again."
    );
  }


  /*
   * -------------------------------------------------------
   * Product / variant availability
   * -------------------------------------------------------
   */

  if (
    errorCode === "VARIANT_UNAVAILABLE" ||
    errorCode === "PRODUCT_UNAVAILABLE" ||
    errorCode === "UNFULFILLABLE_VARIANT"
  ) {
    return (
      "One or more items in your cart are no longer available. " +
      "Please review your cart, remove or change the unavailable " +
      "item, and try checkout again."
    );
  }


  /*
   * -------------------------------------------------------
   * Invalid / stale catalog item
   * -------------------------------------------------------
   */

  if (
    errorCode.includes("INVALID_SKU") ||
    serverMessage
      .toLowerCase()
      .includes("invalid sku")
  ) {
    return (
      "One or more items in your cart could not be found. " +
      "Please review your cart and try again."
    );
  }


  /*
   * -------------------------------------------------------
   * Quantity validation
   * -------------------------------------------------------
   */

  if (
    errorCode.includes("QUANTITY") ||
    serverMessage
      .toLowerCase()
      .includes("quantity")
  ) {
    return (
      "One or more item quantities could not be accepted. " +
      "Please review your cart and try again."
    );
  }


  /*
   * -------------------------------------------------------
   * Customer / shipping address validation
   * -------------------------------------------------------
   */

  if (
    errorCode.includes("ADDRESS") ||
    errorCode.includes("SHIPPING_ADDRESS") ||
    serverMessage
      .toLowerCase()
      .includes("address")
  ) {
    return (
      "We couldn't validate the shipping information provided. " +
      "Please review your address and try again."
    );
  }


  /*
   * -------------------------------------------------------
   * Other client-side checkout errors
   * -------------------------------------------------------
   */

  if (status >= 400 && status < 500) {
    return (
      "Checkout could not be completed. " +
      "Please review your information and try again."
    );
  }


  /*
   * -------------------------------------------------------
   * Safe fallback
   * -------------------------------------------------------
   */

  return (
    "Checkout could not be completed. " +
    "Your cart has been preserved. Please try again."
  );
},


  start:
    async function (cart) {
      if (
        !Array.isArray(
          cart
        ) ||
        cart.length === 0
      ) {
        this.showError(
          "Your cart is empty."
        );

        return;
      }


      if (!this.endpoint) {
        console.log(
          "Checkout cart:",
          cart
        );

        this.showError(
          "Checkout provider has not been configured yet."
        );

        return;
      }


      const customer =
        this.validateCustomer();


      if (!customer) {
        return;
      }


      const button =
        document.getElementById(
          "checkout-button"
        );


      if (button) {
        button.disabled =
          true;

        button.textContent =
          "Opening Checkout...";
      }


      try {
        const response =
          await fetch(
            this.endpoint,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",

                "Accept":
                  "application/json"
              },

              body:
                JSON.stringify({
                  email:
                    customer.email,

                  customer:
                    customer.customer,

                  items:
                    cart.map(
                      function (
                        item
                      ) {
                        return {
                          productId:
                            item.productId,

                          sku:
                            item.sku,

                          quantity:
                            item.quantity
                        };
                      }
                    )
                })
            }
          );


        let data = {};

        try {
          data =
            await response.json();
        } catch (error) {
          /*
           * A Worker or upstream provider
           * may occasionally return HTML,
           * plain text, or an empty body.
           */
          data = {};
        }


        if (!response.ok) {
          const checkoutError =
            new Error(
              this.getCheckoutErrorMessage(
                response,
                data
              )
            );

          checkoutError.status =
            response.status;

          throw checkoutError;
        }


        if (
          data &&
          typeof data.checkoutUrl ===
            "string" &&
          data.checkoutUrl.trim()
        ) {
          window.location.href =
            data.checkoutUrl;

          return;
        }


        throw new Error(
          "Checkout could not be started. Your cart has been preserved so you can try again."
        );


      } catch (error) {
        console.error(
          "Checkout error:",
          error
        );


        /*
         * fetch() rejects for network-level
         * problems such as offline state,
         * DNS failure, or connection failure.
         */
        if (
          !navigator.onLine
        ) {
          this.showError(
            "You're offline. Reconnect to the internet and try checkout again."
          );
        } else {
          this.showError(
            error?.message ||
            "Checkout is temporarily unavailable. Your cart has been preserved."
          );
        }


        if (button) {
          button.disabled =
            false;

          button.textContent =
            "Checkout";
        }
      }
    }
};