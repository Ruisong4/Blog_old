/**
 * Created by cabbage on 17/05/26.
 */
window.onload=function () {

    Bmob.initialize("ed4aedea541215a93b483fbe0e9c8bc3", "bcfdb82a2462b1e83a535b77ca8104ff");
    document.getElementById("getHelp").onclick = function () {
        document.getElementById("help").style.display="block";
    }

    if(Bmob.User.current()){
        if(Bmob.User.current().get("authority")<100)window.open("index.html","_self");
        else(window.open("upload.html","_self"));}
//检查是否已经登录 如果已经登录根据用户权限做相应的跳转
    var submit = document.getElementById("login");

    submit.onclick =

        function () {

            var password = document.getElementById("password").value;
            var userName = document.getElementById("username").value;  //获取用户信息

            Bmob.User.logIn(userName, password, {    //登录
                success: function(user) {

                    alert("登录成功");

                    //1代表来自目录的登录
                    //2代表来自于文章内容页的登录
                    if(Bmob.User.current()){
                        if(getParameter("from")=="1"&&Bmob.User.current().get("authority")<100){window.open("ArticleList.html","_self")}
                        else if(getParameter("from")=="2"&&Bmob.User.current().get("authority")<100)
                        {window.open("Articles.html?id="+getParameter("id"),"_self")}
                        else{window.open("upload.html","_self")}}
                },
                error: function(user, error) {
                    alert("登陆失败请检查密码用户名");
                }
            });
        };



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

};
