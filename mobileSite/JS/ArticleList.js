/**
 * Created by cabbage on 17/05/27.
 */



/*
* 过来可能带有的参数
* page 这是第几页
* dir 指定为什么类型的文章
* 或者说两个都有
* */
var page = 4;
window.onload = function () {
    Bmob.initialize("ed4aedea541215a93b483fbe0e9c8bc3", "bcfdb82a2462b1e83a535b77ca8104ff");
    if(Bmob.User.current()){
        document.getElementById("logIn").style.display = "none";
    }

    var dir = decodeURI(getParameter("dir"));
    //检查url参数
    var Articles = Bmob.Object.extend("Articles");
    var query = new Bmob.Query(Articles);
    //创建query对象
    query.limit(4);
    //每一页最多返回8条信息
    if(dir!="")query.equalTo("type",dir);
    //如果处于分类目录 添加分类查询条件

    if(Bmob.User.current()){
        query.lessThanOrEqualTo("requestAuthority",Bmob.User.current().get("authority"))
    }
    else{
        query.equalTo("requestAuthority",0);
    }
    query.descending("timeDistant");
    query.find({
        success: function(results) {
            //alert(results.length);
            for(var i=0;i<results.length;i++){
                var obj = results[i]; //获取对象
                var thisItem = document.getElementsByClassName("Item")[i]; //获取相应item
                thisItem.getElementsByTagName("a")[0].innerHTML=obj.get("title"); //设置标题
                thisItem.getElementsByTagName("a")[0].href = "Articles.html?id="+ obj.id; //设置标题链接
                //title
                var ps = thisItem.getElementsByTagName("p");
                ps[0].innerHTML = obj.createdAt+"&nbsp;&nbsp;&nbsp;·";//设置时间
                thisItem.getElementsByTagName("a")[1].innerHTML=obj.get("type"); //设置分类
                thisItem.getElementsByTagName("a")[1].href = "ArticleList.html?dir="+ obj.get("type"); //设置分类链接
                //info
                thisItem.getElementsByClassName("ItemIntro")[0].innerHTML=obj.get("intro");
                //intro
                thisItem.style.display = "block";
            }
            //循环处理返回结果
        },
        error: function(error) {
           alert("从数据库拉去数据时出现未知错误，请刷新页面。错误描述："+error.message);
        }
    });

        document.getElementsByTagName("input")[0].onclick = function () {
        var query1 = new Bmob.Query(Articles)
        query1.skip(page*1);
        page+=4;
        query1.limit(4);
        if(dir!="")query1.equalTo("type",dir);
        if(Bmob.User.current()){
            query1.lessThanOrEqualTo("requestAuthority",Bmob.User.current().get("authority"))
        }
        else{
            query1.equalTo("requestAuthority",0);
        }
        query1.descending("timeDistant");
        query1.find({success:function(results) {
            if(results.length==0)alert("没有更多内容了额");
            for(var i=0;i<results.length;i++){
                var obj = results[i];
                var div1 = document.createElement("div");
                div1.className = "Item";
                var div2 = document.createElement("div");
                div2.className = "ItemTitle";
                var div3 = document.createElement("div");
                div3.className = "ItemInfo";
                var div4 = document.createElement("div");
                div4.className = "ItemIntro";
                var p1 = document.createElement("p");
                p1.className = "ItemTime";
                var p2 = document.createElement("p");
                p2.className = "ItemType";
                var Hone = document.createElement("h2");
                var A = document.createElement("a");
                A.innerHTML = obj.get("title");
                A.href = "Articles.html?id="+ obj.id
                Hone.appendChild(A);
                div2.appendChild(Hone);
                p1.innerHTML = obj.createdAt+"&nbsp;&nbsp;&nbsp;·"
                var A2 = document.createElement("a");
                A2.innerHTML = obj.get("type");
                A2.href =  "ArticleList.html?dir="+ obj.get("type");
                p2.appendChild(A2);
                div4.innerHTML = obj.get("intro");

                div1.appendChild(div2);
                div3.appendChild(p1);
                div3.appendChild(p2);
                div1.appendChild(div3);
                div1.appendChild(div4)
                div1.style.display = "block";
                document.getElementById("container").appendChild(div1);

            }
        },
        error:function(error){
            alert("加载失败，错误描述："+ error.message);
        }}
        )
    }

    function getParameter(name) {
        var url = document.location.href;
        var start = url.indexOf("?")+1;
        if (start==0) {
            return "";
        }
        var value = "";
        var queryString = url.substring(start);
        var paraNames = queryString.split("&");
        for (var i=0; i<paraNames.length; i++) {
            if (name==getParameterName(paraNames[i])) {
                value = getParameterValue(paraNames[i])
            }
        }
        return value;
    }
    function getParameterName(str) {
        var start = str.indexOf("=");
        if (start==-1) {
            return str;
        }
        return str.substring(0,start);
    }

    function getParameterValue(str) {
        var start = str.indexOf("=");
        if (start==-1) {
            return "";
        }
        return str.substring(start+1);
    }

    function logout() {
        Bmob.User.logOut();
        window.open("ArticleList.html","_self");
    }
};