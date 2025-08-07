## 页面跳转支付
请求URL
https://z-pay.cn/submit.php
请求方法
POST 或 GET（推荐POST，不容易被劫持或屏蔽）
此接口可用于用户前台直接发起支付，使用form表单跳转或拼接成url跳转。
请求参数
参数	名称	类型	是否必填	描述	范例
name	商品名称	String	是	商品名称不超过100字	iphonexs max
money	订单金额	String	是	最多保留两位小数	5.67
type	支付方式	String	是	支付宝：alipay 微信支付：wxpay	alipay
out_trade_no	订单编号	Num	是	每个商品不可重复	201911914837526544601
notify_url	异步通知页面	String	是	交易信息回调页面，不支持带参数	http://www.aaa.com/bbb.php
pid	商户唯一标识	String	是	一串字母数字组合	201901151314084206659771
cid	支付渠道ID	String	否	如果不填则随机使用某一支付渠道	1234
param	附加内容	String	否	会通过notify_url原样返回	金色 256G
return_url	跳转页面	String	是	交易完成后浏览器跳转，不支持带参数	http://www.aaa.com/ccc.php
sign	签名（参考本页签名算法）	String	是	用于验证信息正确性，采用md5加密	28f9583617d9caf66834292b6ab1cc89
sign_type	签名方法	String	是	默认为MD5	MD5
用法举例
https://z-pay.cn/submit.php?name=iphone xs Max 一台&money=0.03&out_trade_no=201911914837526544601&notify_url=http://www.aaa.com/notify_url.php&pid=201901151314084206659771&param=金色 256G&return_url=http://www.baidu.com&sign=28f9583617d9caf66834292b6ab1cc89&sign_type=MD5&type=alipay

成功返回
直接跳转到付款页面
说明：该页面为收银台，直接访问这个url即可进行付款
失败返回
{"code":"error","msg":"具体的错误信息"}

## 支付结果通知
请求URL
服务器异步通知（notify_url）、页面跳转通知（return_url）
请求方法
GET
请求参数
参数	名称	类型	描述	范例
pid	商户ID	String		201901151314084206659771
name	商品名称	String	商品名称不超过100字	iphone
money	订单金额	String	最多保留两位小数	5.67
out_trade_no	商户订单号	String	商户系统内部的订单号	201901191324552185692680
trade_no	易支付订单号	String	易支付订单号	2019011922001418111011411195
param	业务扩展参数	String	会通过notify_url原样返回	金色 256G
trade_status	支付状态	String	只有TRADE_SUCCESS是成功	TRADE_SUCCESS
type	支付方式	String	包括支付宝、微信	alipay
sign	签名（参考本页签名算法）	String	用于验证接受信息的正确性	ef6e3c5c6ff45018e8c82fd66fb056dc
sign_type	签名类型	String	默认为MD5	MD5
如何验证
请根据签名算法，验证自己生成的签名与参数中传入的签名是否一致，如果一致则说明是由官方向您发送的真实信息
注意事项
1.收到回调信息后请返回“success”，否则程序将判定您的回调地址未正确通知到。

2.同样的通知可能会多次发送给商户系统。商户系统必须能够正确处理重复的通知。

3.推荐的做法是，当收到通知进行处理时，首先检查对应业务数据的状态，判断该通知是否已经处理过，如果没有处理过再进行处理，如果处理过直接返回结果成功。在对业务数据进行状态检查和处理之前，要采用数据锁进行并发控制，以避免函数重入造成的数据混乱。

4.特别提醒：商户系统对于支付结果通知的内容一定要做签名验证,并校验返回的订单金额是否与商户侧的订单金额一致，防止数据泄漏导致出现“假通知”，造成资金损失。

5.对后台通知交互时，如果平台收到商户的应答不是纯字符串success或超过5秒后返回时，平台认为通知失败，平台会通过一定的策略（通知频率为0/15/15/30/180/1800/1800/1800/1800/3600，单位：秒）间接性重新发起通知，尽可能提高通知的成功率，但不保证通知最终能成功。


## MD5签名算法
1、将发送或接收到的所有参数按照参数名ASCII码从小到大排序（a-z），sign、sign_type、和空值不参与签名！

2、将排序后的参数拼接成URL键值对的格式，例如 a=b&c=d&e=f，参数值不要进行url编码。

3、再将拼接好的字符串与商户密钥KEY进行MD5加密得出sign签名参数，sign = md5 ( a=b&c=d&e=f + KEY ) （注意：+ 为各语言的拼接符，不是字符！），md5结果为小写。

4、具体签名与发起支付的示例代码可下载SDK查看。


## 签名算法示例代码

const utility=require("utility"); //导入md5第三方库
 
let data={
            pid:"你的pid",
            money:"金额",
            name:"商品名称",
            notify_url:"http://xxxxx",//异步通知地址
            out_trade_no:"2019050823435494926", //订单号,自己生成。我是当前时间YYYYMMDDHHmmss再加上随机三位数
            return_url:"http://xxxx",//跳转通知地址
            sitename:"网站名称",
            type:"alipay",//支付方式:alipay:支付宝,wxpay:微信支付,qqpay:QQ钱包,tenpay:财付通,
 }
 
//参数进行排序拼接字符串(非常重要)
function  getVerifyParams(params) {
        var sPara = [];
        if(!params) return null;
        for(var key in params) {
            if((!params[key]) || key == "sign" || key == "sign_type") {
                continue;
            };
            sPara.push([key, params[key]]);
        }
        sPara = sPara.sort();
        var prestr = '';
        for(var i2 = 0; i2 < sPara.length; i2++) {
            var obj = sPara[i2];
            if(i2 == sPara.length - 1) {
                prestr = prestr + obj[0] + '=' + obj[1] + '';
            } else {
                prestr = prestr + obj[0] + '=' + obj[1] + '&';
            }
        }
        return prestr;
}
 
 
 
//对参数进行排序，生成待签名字符串--(具体看支付宝)
let str=getVerifyParams(data);
 
let key="你的key";//密钥,易支付注册会提供pid和秘钥
 
//MD5加密--进行签名
let sign=utility.md5(str+key);//注意支付宝规定签名时:待签名字符串后要加key
 
最后要将参数返回给前端，前端访问url发起支付
let result =`https://z-pay.cn/submit.php?${str}&sign=${sign}&sign_type=MD5`；
 