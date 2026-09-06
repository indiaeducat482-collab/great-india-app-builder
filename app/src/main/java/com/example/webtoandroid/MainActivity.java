package com.example.webtoandroid;

import android.app.*;
import android.os.*;
import android.graphics.Color;
import android.view.*;
import android.webkit.*;
import android.widget.*;
import android.graphics.drawable.GradientDrawable;

public class MainActivity extends Activity {
    WebView web;
    @Override public void onCreate(Bundle b){
        super.onCreate(b);
        LinearLayout root=new LinearLayout(this); root.setOrientation(LinearLayout.VERTICAL);
        LinearLayout bar=new LinearLayout(this); bar.setGravity(Gravity.CENTER_VERTICAL); bar.setPadding(16,8,16,8);
        bar.setBackgroundColor(Color.WHITE);
        ImageView logo=new ImageView(this); logo.setImageResource(com.example.webtoandroid.R.drawable.app_logo);
        logo.setScaleType(ImageView.ScaleType.CENTER_INSIDE);
        bar.addView(logo,new LinearLayout.LayoutParams(48,48));
        TextView title=new TextView(this); title.setText(getString(R.string.app_name)); title.setTextSize(20); title.setTextColor(Color.BLACK); title.setGravity(Gravity.CENTER_VERTICAL);
        LinearLayout.LayoutParams tp=new LinearLayout.LayoutParams(0,56,1); tp.leftMargin=12; bar.addView(title,tp);
        root.addView(bar,new LinearLayout.LayoutParams(-1,64));
        web=new WebView(this); web.setBackgroundColor(Color.WHITE);
        WebSettings s=web.getSettings(); s.setJavaScriptEnabled(true); s.setDomStorageEnabled(true); s.setSupportZoom(false); s.setAllowFileAccess(true);
        web.setWebViewClient(new WebViewClient());
        String url=getIntent().getStringExtra("url");
        if(url==null || url.trim().isEmpty()) url="https://example.com";
        web.loadUrl(url);
        root.addView(web,new LinearLayout.LayoutParams(-1,0,1)); setContentView(root);
    }
    @Override public void onBackPressed(){ if(web!=null && web.canGoBack()) web.goBack(); else super.onBackPressed(); }
}