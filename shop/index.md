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
	{% if site.data.store.collections %}

	  <nav
		class="shop-collections"
		aria-label="Product collections"
	  >

		<a
		  href="{{ '/shop/' | relative_url }}"
		  class="shop-collections__link is-active"
		>
		  All
		</a>


		{% for collection in site.data.store.collections %}

		  <a
			href="{{ '/collections/' | relative_url }}?collection={{ collection.handle | url_encode }}"
			class="shop-collections__link"
		  >
			{{ collection.title }}
		  </a>

		{% endfor %}

	  </nav>

	{% endif %}
    <div class="product-grid">

      {% for product in site.products %}

        {% include product-card.html product=product %}

      {% endfor %}

    </div>

  </div>

</section>