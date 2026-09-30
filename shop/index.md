---
layout: default
title: Shop
---

<section class="shop-page">

  <div class="page-width">

    <header class="shop-page__header">

      <p class="shop-page__eyebrow">
        Shop
      </p>

      <h1>All Products</h1>

      <p>
        Browse the complete collection.
      </p>

    </header>

    {% include shop-collections.html active="all" %}

    <div class="product-grid">

      {% for product in site.products %}

        {% include product-card.html product=product %}

      {% endfor %}

    </div>

  </div>

</section>
