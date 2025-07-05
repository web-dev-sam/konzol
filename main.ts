// In your .d.ts files
declare function log(format: string, ...args: unknown[]): void

const data = {
  report_metadata: {
    generated_at: '2024-06-29T14:32:18.247Z',
    report_id: 'rpt_7a8b9c2d1e3f4g5h',
    account_id: 'acc_shopify_plus_enterprise_001',
    billing_tier: 'enterprise',
    data_retention_days: 730,
    api_version: 'v2.3.1',
    rate_limit: {
      remaining: 4847,
      reset_at: 1719668400,
    },
  },

  tenant_configs: [
    {
      tenant_id: 'tnnt_fashion',
      platform: 'shopify_plus',
      store_url: 'fashionboutique.myshopify.com',
      primary_currency: 'USD',
      timezone: 'America/New_York',
      integration_settings: {
        webhooks_enabled: true,
        real_time_sync: false,
        batch_sync_interval: '4_hours',
        last_sync: {
          orders: '2024-06-29T10:15:33Z',
          customers: '2024-06-29T09:42:17Z',
          products: '2024-06-29T08:30:45Z',
        },
      },
      custom_fields_mapping: {
        customer_lifetime_value: 'metafields.custom.clv',
        acquisition_channel: 'tags',
        loyalty_tier: 'metafields.loyalty.tier_status',
      },
    },
    {
      tenant_id: 'tnnt_techgadgets',
      platform: 'woocommerce',
      domain: 'techgadgets.com',
      primary_currency: 'EUR',
      timezone: 'Europe/Berlin',
      integration_settings: {
        api_key_expires: '2024-12-31T23:59:59Z',
        sync_enabled: true,
        sync_frequency: 'hourly',
        failed_sync_attempts: 3,
        last_error: {
          timestamp: '2024-06-29T13:22:15Z',
          error_code: 'RATE_LIMIT_EXCEEDED',
          retry_after: 1800,
        },
      },
    },
  ],

  metrics: {
    date_range: {
      start: '2024-06-01T00:00:00Z',
      end: '2024-06-29T23:59:59Z',
    },
    revenue: {
      by_tenant: {
        tnnt_fashion: {
          total_revenue: 284750.67,
          currency: 'USD',
          order_count: 1547,
          breakdown: {
            organic: {
              revenue: 142375.34,
              orders: 623,
              avg_order_value: 228.56,
            },
            paid_social: {
              revenue: 91440.22,
              orders: 412,
              attribution_model: 'last_click',
              platforms: {
                facebook_ads: {
                  spend: 18288.04,
                  revenue: 54663.13,
                  roas: 2.99,
                  campaign_ids: ['camp_fb_23894756', 'camp_fb_23894851'],
                },
                instagram_ads: {
                  spend: 12192.18,
                  revenue: 36777.09,
                  roas: 3.02,
                },
              },
            },
            email_marketing: {
              revenue: 36842.15,
              orders: 287,
              campaigns: [
                {
                  campaign_id: 'email_summer_sale_2024',
                  sent_date: '2024-06-15T09:00:00Z',
                  revenue_attributed: 18421.08,
                  orders_attributed: 143,
                  conversion_rate: 0.0234,
                },
              ],
            },
            influencer: {
              revenue: 14092.96,
              orders: 225,
              collaborations: [
                {
                  influencer_handle: '@fashionista_sarah',
                  platform: 'instagram',
                  discount_code: 'SARAH20',
                  commission_rate: 0.08,
                  revenue_generated: 8455.78,
                  orders: 134,
                },
              ],
            },
          },
        },
        tnnt_techgadgets: {
          total_revenue: 156890.45,
          currency: 'EUR',
          order_count: 892,
          vat_collected: 31378.09,
          breakdown: {
            direct_traffic: {
              revenue: 62756.18,
              orders: 357,
            },
            affiliate_network: {
              revenue: 47067.14,
              orders: 268,
              top_affiliates: [
                {
                  affiliate_id: 'aff_tech_reviews_pro',
                  commission_rate: 0.05,
                  revenue_generated: 23533.57,
                  commission_owed: 1176.68,
                },
              ],
            },
            google_ads: {
              revenue: 47067.13,
              orders: 267,
              campaigns: {
                search: {
                  spend: 9413.43,
                  revenue: 28240.28,
                  keywords: ['wireless earbuds', 'smartphone accessories', 'laptop stands'],
                },
                shopping: {
                  spend: 6275.62,
                  revenue: 18826.85,
                  product_groups: ['electronics', 'accessories', 'gadgets'],
                },
              },
            },
          },
        },
      },
    },
  },

  customer_analytics: {
    segmentation_data: {
      tnnt_fashion: {
        total_customers: 12847,
        segments: {
          high_value: {
            count: 1542,
            criteria: {
              lifetime_value_min: 1000,
              orders_min: 5,
            },
            avg_lifetime_value: 1847.32,
            recent_activity: {
              last_30_days: {
                active_customers: 423,
                revenue: 78234.56,
                avg_days_between_orders: 18.5,
              },
            },
          },
          at_risk: {
            count: 2156,
            criteria: {
              last_order_days_ago_min: 90,
              previous_order_frequency: 'monthly',
            },
            win_back_campaigns: [
              {
                campaign_name: 'Come Back - 30% Off',
                sent_date: '2024-06-20T10:00:00Z',
                recipients: 856,
                open_rate: 0.234,
                click_rate: 0.067,
                conversion_rate: 0.023,
                revenue_generated: 4567.89,
              },
            ],
          },
          new_customers: {
            count: 3890,
            acquisition_period: 'last_90_days',
            sources: {
              organic_search: 1245,
              paid_social: 987,
              referral: 654,
              direct: 543,
              email_signup: 461,
            },
            onboarding_sequence: {
              welcome_email: {
                sent: 3890,
                opened: 1479,
                clicked: 623,
              },
              first_purchase_discount: {
                redeemed: 1834,
                revenue_from_redemption: 45623.78,
              },
            },
          },
        },
      },
      tnnt_techgadgets: {
        total_customers: 8934,
        b2b_customers: {
          count: 234,
          avg_order_value: 890.45,
          bulk_discounts_applied: {
            total_discount_amount: 12456.78,
            orders_with_discount: 156,
          },
        },
        consumer_customers: {
          count: 8700,
          subscription_customers: {
            active: 456,
            monthly_recurring_revenue: 15678.90,
            churn_rate_monthly: 0.034,
            avg_subscription_length_months: 14.7,
          },
        },
      },
    },
  },

  products: {
    inventory_sync_data: {
      tnnt_fashion: {
        last_inventory_update: '2024-06-29T12:45:32Z',
        categories: {
          womens_clothing: {
            dresses: {
              total_skus: 347,
              bestsellers: [
                {
                  product_id: 'prod_summer_maxi_dress_floral',
                  sku: 'SMD-FLRL-2024-S/M/L/XL',
                  revenue_28_days: 8934.67,
                  units_sold: 234,
                  variants: [
                    {
                      variant_id: 'var_smd_flrl_s_navy',
                      size: 'S',
                      color: 'Navy',
                      inventory_level: 12,
                      reserved: 3,
                      units_sold: 67,
                    },
                    {
                      variant_id: 'var_smd_flrl_m_coral',
                      size: 'M',
                      color: 'Coral',
                      inventory_level: 8,
                      reserved: 1,
                      units_sold: 89,
                    },
                  ],
                  reviews: {
                    avg_rating: 4.6,
                    total_reviews: 89,
                    recent_reviews: [
                      {
                        rating: 5,
                        review_text: 'Perfect for summer events!',
                        customer_id: 'cust_vip_sarah_j_1987',
                        verified_purchase: true,
                        helpful_votes: 12,
                      },
                    ],
                  },
                },
              ],
              underperforming: [
                {
                  product_id: 'prod_winter_coat_premium',
                  reason: 'seasonal_mismatch',
                  inventory_value_at_risk: 15678.90,
                  suggested_actions: ['markdown_pricing', 'end_of_season_sale'],
                },
              ],
            },
          },
          accessories: {
            bags: {
              cross_sell_data: {
                frequently_bought_with: [
                  {
                    primary_product: 'prod_summer_maxi_dress_floral',
                    secondary_product: 'prod_straw_sun_hat',
                    co_occurrence_rate: 0.234,
                    bundle_revenue: 3456.78,
                  },
                ],
              },
            },
          },
        },
      },
      tnnt_techgadgets: {
        categories: {
          audio: {
            wireless_earbuds: {
              market_trends: {
                price_sensitivity_analysis: {
                  optimal_price_point: 89.99,
                  demand_elasticity: -1.23,
                  competitor_pricing: {
                    amazon_avg: 79.99,
                    bestbuy_avg: 94.99,
                    direct_manufacturer_avg: 69.99,
                  },
                },
              },
              top_performers: [
                {
                  product_id: 'prod_wb_pro_anc_2024',
                  manufacturer: 'TechBrand Pro',
                  model: 'ActiveNoise Pro X',
                  wholesale_cost: 45.60,
                  retail_price: 129.99,
                  margin: 0.649,
                  units_sold_ytd: 1247,
                  return_rate: 0.034,
                  warranty_claims: 23,
                  supplier_info: {
                    supplier_id: 'supp_techbrand_asia_001',
                    lead_time_days: 21,
                    minimum_order_qty: 100,
                    next_restock_date: '2024-07-15T00:00:00Z',
                  },
                },
              ],
            },
          },
        },
      },
    },
  },

  marketing_attribution: {
    cross_platform_tracking: {
      customer_journey_data: [
        {
          customer_id: 'cust_journey_example_001',
          tenant_id: 'tnnt_fashion',
          total_revenue: 847.93,
          touchpoints: [
            {
              timestamp: '2024-06-01T14:23:18Z',
              channel: 'organic_search',
              source: 'google',
              keyword: 'summer dresses 2024',
              device: 'mobile',
              session_duration: 127,
              pages_viewed: 5,
              products_viewed: ['prod_summer_maxi_dress_floral', 'prod_casual_sundress_stripe'],
            },
            {
              timestamp: '2024-06-03T19:45:22Z',
              channel: 'social_media',
              source: 'instagram',
              content_type: 'story',
              influencer: '@fashionista_sarah',
              device: 'mobile',
              action: 'product_save',
            },
            {
              timestamp: '2024-06-05T11:30:45Z',
              channel: 'email',
              campaign: 'email_summer_sale_2024',
              email_type: 'promotional',
              device: 'desktop',
              action: 'click_through',
              products_clicked: ['prod_summer_maxi_dress_floral'],
            },
            {
              timestamp: '2024-06-05T11:47:33Z',
              channel: 'direct',
              source: 'website',
              device: 'desktop',
              session_duration: 892,
              cart_abandonment: {
                abandoned_at: '2024-06-05T12:02:18Z',
                cart_value: 178.97,
                recovery_email_sent: '2024-06-05T14:00:00Z',
              },
            },
            {
              timestamp: '2024-06-06T20:15:07Z',
              channel: 'email',
              campaign: 'cart_abandonment_sequence_email_1',
              device: 'mobile',
              action: 'purchase',
              order_id: 'ord_fashionboutique_78934',
              order_value: 156.98,
              discount_used: {
                code: 'COMEBACK15',
                discount_amount: 21.99,
              },
            },
          ],
          attribution_model_results: {
            first_touch: {
              channel: 'organic_search',
              revenue_credited: 156.98,
            },
            last_touch: {
              channel: 'email',
              revenue_credited: 156.98,
            },
            linear: {
              organic_search: 31.40,
              social_media: 31.40,
              email: 62.79,
              direct: 31.39,
            },
            time_decay: {
              organic_search: 15.70,
              social_media: 23.55,
              email: 94.18,
              direct: 23.55,
            },
          },
        },
      ],
    },
  },

  technical_metadata: {
    data_quality_metrics: {
      completeness_scores: {
        customer_data: 0.94,
        order_data: 0.98,
        product_data: 0.87,
        inventory_data: 0.91,
      },
      sync_status: {
        shopify_webhooks: {
          orders_created: {
            last_received: '2024-06-29T14:28:45Z',
            processing_lag_seconds: 3.2,
            success_rate_24h: 0.997,
          },
          inventory_updates: {
            last_received: '2024-06-29T14:30:12Z',
            batch_size: 45,
            failed_items: 2,
            retry_queue_size: 0,
          },
        },
        woocommerce_api: {
          polling_interval: 3600,
          last_successful_poll: '2024-06-29T13:00:00Z',
          rate_limit_hit: false,
          pending_syncs: ['customers', 'product_reviews'],
        },
      },
    },
    system_performance: {
      query_execution_times: {
        revenue_aggregation: {
          avg_ms: 1247,
          p95_ms: 2345,
          p99_ms: 4567,
        },
        customer_segmentation: {
          avg_ms: 892,
          cache_hit_rate: 0.67,
        },
      },
      data_storage: {
        total_size_gb: 847.3,
        monthly_growth_gb: 23.4,
        backup_status: {
          last_backup: '2024-06-29T02:00:00Z',
          backup_size_gb: 823.1,
          verification_status: 'passed',
        },
      },
    },
  },
}

log!('Analytics: {products}', data)
log!('Analytics: {products.1}', data, data)
// log!('Found {:@floral|@summer|c} string that contain "floral" and "summer"', data)

// fetch(`https://jsonplaceholder.typicode.com/users`)
//   .then((r) => r.json())
//   .then((users) => {
//     log!('Original: {}', users)
//     log!('{*.address.geo.lat}', users)
//     log!('{*.address.geo.lat:k}', users) // |gt<0>
//   })

// fetch(`https://jsonplaceholder.typicode.com/photos`)
//   .then((r) => r.json())
//   .then((photos) => {
//     log!('Photos:     {*:count}', photos)
//     log!('Albums:     {*.albumId:unique|count}', photos)
//     log!('Thumbnails: {*.thumbnailUrl:unique|count}', photos)
//     // ^^^ 5000 - 4996 => 4 duplicate thumbnails ^^^
//   })
